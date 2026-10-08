import mongoose from 'mongoose';
import { ENV } from './env.js';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(ENV.MONGODB_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host} | Database: ${conn.connection.name}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error (${ENV.MONGODB_URI}): ${error.message}`);
    try {
      console.log('🔄 Attempting fallback to local MongoDB (mongodb://127.0.0.1:27017/easycart)...');
      const localConn = await mongoose.connect('mongodb://127.0.0.1:27017/easycart');
      console.log(`✅ Connected to Local MongoDB: ${localConn.connection.host}`);
    } catch (localError) {
      console.error(`❌ Fallback to local MongoDB also failed: ${localError.message}`);
      console.error('💡 Tip: If using MongoDB Atlas, check that Network Access is set to allow access from anywhere (0.0.0.0/0) in MongoDB Atlas.');
    }
  }
};
