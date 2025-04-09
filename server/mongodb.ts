import mongoose from 'mongoose';
import { log } from './vite';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || '';

if (!MONGO_URI) {
  console.error('Error: MONGO_URI environment variable not set');
  process.exit(1);
}

// Connect to MongoDB
export async function connectToMongoDB() {
  try {
    log('Connecting to MongoDB...', 'mongodb');
    await mongoose.connect(MONGO_URI);
    log('Connected to MongoDB successfully!', 'mongodb');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

// Define User schema and model
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

// Define Todo schema and model
const todoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  completed: { type: Boolean, default: false },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

// Create models
export const User = mongoose.model('User', userSchema);
export const Todo = mongoose.model('Todo', todoSchema);