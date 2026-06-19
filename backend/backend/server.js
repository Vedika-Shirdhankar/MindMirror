// server.js
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const journalRoutes = require('./routes/journalRoutes');
const chatRoutes = require('./routes/chatRoutes');
const letterRoutes = require('./routes/letterRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }));
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/journal', journalRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/letters', letterRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/users', userRoutes);

// 404 handler for unmatched API routes
app.use('/api', (req, res) => res.status(404).json({ error: 'Route not found.' }));

// Centralized error handler — must be last
app.use(errorHandler);

const PORT = process.env.PORT || 4000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`🚀 MindMirror API running on port ${PORT}`));
});