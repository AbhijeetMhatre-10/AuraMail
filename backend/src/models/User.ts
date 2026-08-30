import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  googleId: string;
  email: string;
  name: string;
  picture?: string;
  isDemoUser?: boolean;
  preferences: {
    defaultTone: 'Professional' | 'Friendly' | 'Formal' | 'Concise';
    autoSummarize: boolean;
    autoCategorize: boolean;
    theme: 'dark' | 'light' | 'system';
  };
  lastLogin: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    googleId: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    name: { type: String, required: true, trim: true },
    picture: { type: String, default: '' },
    isDemoUser: { type: Boolean, default: false },
    preferences: {
      defaultTone: {
        type: String,
        enum: ['Professional', 'Friendly', 'Formal', 'Concise'],
        default: 'Professional',
      },
      autoSummarize: { type: Boolean, default: true },
      autoCategorize: { type: Boolean, default: true },
      theme: { type: String, enum: ['dark', 'light', 'system'], default: 'dark' },
    },
    lastLogin: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model<IUser>('User', UserSchema);
