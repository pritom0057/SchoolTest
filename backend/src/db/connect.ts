import mongoose from 'mongoose';
import { env } from '../config/env.js';

export async function connectDB() {
  mongoose.set('strictQuery', true);
  await mongoose.connect(env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 10000,
    family: 4,
  } as any);
  console.log('✅ MongoDB connected');
}
