import mongoose from 'mongoose';

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/fashion_store';
  try {
    await mongoose.connect(uri, {
      dbName: process.env.MONGODB_DB || undefined
    });
    // eslint-disable-next-line no-console
    console.log('MongoDB connected');
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};


