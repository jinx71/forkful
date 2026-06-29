const mongoose = require('mongoose');

let connected = false;

const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.warn('[db] MONGO_URI not set — auth & favorites disabled.');
    return false;
  }
  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 4000,
    });
    connected = true;
    console.log(`[db] MongoDB connected → ${mongoose.connection.host}`);
    return true;
  } catch (err) {
    console.warn(`[db] connection failed: ${err.message} — continuing without DB.`);
    return false;
  }
};

const isConnected = () => connected && mongoose.connection.readyState === 1;

module.exports = { connectDB, isConnected };
