import mongoose, { Schema, Document } from 'mongoose';

// Connect to MongoDB
export async function connectMongoDB() {
  try {
    const mongoUrl = process.env.MONGODB_URL || 'mongodb://localhost:27017/student-directory';
    await mongoose.connect(mongoUrl);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

// User interface for MongoDB
export interface IUser extends Document {
  _id: string;
  username: string;
  password: string;
}

// Student interface for MongoDB
export interface IStudent extends Document {
  _id: string;
  name: string;
  email: string;
  course: string;
  batch: string;
  imageUrl: string;
  linkedinUrl: string;
}

// Admin Session interface for MongoDB
export interface IAdminSession extends Document {
  _id: string;
  sessionToken: string;
  username: string;
  createdAt: Date;
  expiresAt: Date;
}

// User Schema
const userSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
}, {
  timestamps: true
});

// Student Schema
const studentSchema = new Schema<IStudent>({
  name: { type: String, required: true },
  email: { type: String, required: true },
  course: { type: String, required: true },
  batch: { type: String, required: true },
  imageUrl: { type: String, required: true },
  linkedinUrl: { type: String, required: true }
}, {
  timestamps: true
});

// Admin Session Schema
const adminSessionSchema = new Schema<IAdminSession>({
  sessionToken: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  expiresAt: { type: Date, required: true }
}, {
  timestamps: true
});

// Create models
export const UserModel = mongoose.model<IUser>('User', userSchema);
export const StudentModel = mongoose.model<IStudent>('Student', studentSchema);
export const AdminSessionModel = mongoose.model<IAdminSession>('AdminSession', adminSessionSchema);