import { Schema, model } from 'mongoose';

export type UserRole = 'ADMIN' | 'STUDENT' | 'SUPERVISOR';

const userSchema = new Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, unique: true, required: true, lowercase: true },
  phone: { type: String },
  role: { type: String, enum: ['ADMIN','STUDENT','SUPERVISOR'], default: 'STUDENT' },
  passwordHash: { type: String, required: true },
  emailVerifiedAt: { type: Date },
  otp: {
    code: String,
    expiresAt: Date
  },
  step1LockedAt: { type: Date },
  refreshTokens: [{
    token: String,
    createdAt: { type: Date, default: Date.now },
    userAgent: String,
    revokedAt: Date
  }]
}, { timestamps: true });

export const User = model('User', userSchema);
