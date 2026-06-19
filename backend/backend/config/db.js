// config/db.js
// MongoDB Atlas connection via Mongoose.
// Reads MONGODB_URI from .env — see .env.example for the format.

const mongoose = require('mongoose');

async function connectDB() {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mindmirror';

  try {
    mongoose.set('strictQuery', true);
    console.log("URI loaded:", uri ? "YES" : "NO");
console.log("URI starts with:", uri?.substring(0, 20));

await mongoose.connect(uri);
    await mongoose.connect(uri);
    console.log(`✅ MongoDB connected: ${mongoose.connection.host}/${mongoose.connection.name}`);
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    console.log('Continuing without database connection...');
  }

  mongoose.connection.on('disconnected', () => {
    console.warn('⚠️  MongoDB disconnected');
  });
}

module.exports = connectDB;