require('dotenv').config();

module.exports = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 4000,
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  database: require('./database'),
  jwt: require('./jwt'),
  gemini: require('./gemini'),
  redis: require('./redis'),
  features: require('./features'),
  cloudinaryUrl: process.env.CLOUDINARY_URL,
};
