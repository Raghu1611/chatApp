const mongoose = require('mongoose');
const config = require('./env');

async function connectDB() {
  try {
    await mongoose.connect(config.mongoUri, {
      autoIndex: true,
    });
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
}

module.exports = connectDB;
