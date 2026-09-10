require('dotenv').config();

// Support comma-separated list of allowed origins e.g.
// CORS_ORIGIN=https://mind-mirror-bay.vercel.app,http://localhost:5173
const rawOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';
const corsOrigin = rawOrigin.includes(',')
  ? rawOrigin.split(',').map((o) => o.trim())
  : rawOrigin;

module.exports = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 4000,
  corsOrigin,
  database: require('./database'),
  jwt: require('./jwt'),
  gemini: require('./gemini'),
  redis: require('./redis'),
  features: require('./features'),
  cloudinaryUrl: process.env.CLOUDINARY_URL,
};
