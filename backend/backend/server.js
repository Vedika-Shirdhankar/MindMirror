// server.js — MindMirror API entry point
// Architecture: Routes → Controllers → Services → Utils/Models
// All config is centralized in config/index.js (no scattered process.env)

const config = require('./config');

const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const swaggerUi = require('swagger-ui-express');

const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorHandler');
const { requestLogger } = require('./middleware/requestLogger');
const { checkHealth } = require('./controllers/healthController');
const { swaggerSpec } = require('./utils/swagger');
const logger = require('./utils/logger');

// Job queue — initialized after DB connection
const { initJobQueue } = require('./services/jobQueue');
const { processVideoJob } = require('./services/videoWorker');

// Routes
const authRoutes = require('./routes/authRoutes');
const journalRoutes = require('./routes/journalRoutes');
const chatRoutes = require('./routes/chatRoutes');
const letterRoutes = require('./routes/letterRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const userRoutes = require('./routes/userRoutes');
const videoRoutes = require('./routes/videoRoutes');
const letterFromMirrorRoutes = require('./routes/letterFromMirrorRoutes');
const lifeReportRoutes = require('./routes/lifeReportRoutes');
const jobRoutes = require('./routes/jobRoutes');
const anchorRoutes = require('./routes/anchorRoutes');

const app = express();

// ─── CORS (must be FIRST — before helmet, rate limiter, everything) ───────────
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, Render health checks)
    if (!origin) return callback(null, true);
    const allowed = Array.isArray(config.corsOrigin)
      ? config.corsOrigin
      : [config.corsOrigin];
    if (allowed.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origin ${origin} not allowed`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));
// Explicitly handle OPTIONS preflight for all routes
app.options('*', cors(corsOptions));

// ─── Security ────────────────────────────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { success: false, error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(mongoSanitize());

// ─── Observability ───────────────────────────────────────────────────────────
app.use(requestLogger);

// ─── Static Files ─────────────────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── API Documentation (dev only) ────────────────────────────────────────────
if (config.env !== 'production') {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  logger.info({ message: 'Swagger UI available', url: `http://localhost:${config.port}/api/docs` });
}

// ─── Health ───────────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'mindmirror-api'
  });
});

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/journal', journalRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/letters', letterRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/letter-from-mirror', letterFromMirrorRoutes);
app.use('/api/life-report', lifeReportRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/anchor', anchorRoutes);
// Bhashini route removed

// ─── 404 ──────────────────────────────────────────────────────────────────────
app.use('/api', (req, res) =>
  res.status(404).json({ success: false, error: `Route ${req.method} ${req.originalUrl} not found.` })
);

// ─── Error Handler (must be last) ─────────────────────────────────────────────
app.use(errorHandler);

// ─── Bootstrap ────────────────────────────────────────────────────────────────
async function bootstrap() {
  await connectDB();
  // Initialize job queue after DB connection (non-blocking if Redis is down)
  await initJobQueue(processVideoJob);
  app.listen(config.port, () => {
    logger.info({
      message: '🚀 MindMirror API started',
      port: config.port,
      env: config.env,
      docsUrl: config.env !== 'production' ? `http://localhost:${config.port}/api/docs` : null,
    });
  });
}

bootstrap().catch((err) => {
  logger.error({ message: 'Failed to start server', error: err.message });
  process.exit(1);
});