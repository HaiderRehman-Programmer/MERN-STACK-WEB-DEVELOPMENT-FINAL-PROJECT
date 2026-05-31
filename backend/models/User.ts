import mongoose, { Schema, Document } from 'mongoose';
import { uuidv7 } from 'uuidv7';

export interface IUser extends Document {
  _id: any;
  firstName: string;
  lastName: string;
  email: string;
  hashedPassword?: string;
  role: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';
  avatarUrl?: string;
  isBanned: boolean;
  refreshToken?: string;
  resetToken?: string;
  resetTokenExpiry?: Date;
  verificationToken?: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  _id: { type: String, default: uuidv7 },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  hashedPassword: { type: String },
  role: { type: String, enum: ['STUDENT', 'INSTRUCTOR', 'ADMIN'], default: 'STUDENT' },
  avatarUrl: { type: String },
  isBanned: { type: Boolean, default: false },
  refreshToken: { type: String },
  resetToken: { type: String },
  resetTokenExpiry: { type: Date },
  verificationToken: { type: String },
  isVerified: { type: Boolean, default: false },
}, { timestamps: true });

UserSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    const r = ret as any;
    delete r._id;
    delete r.__v;
    delete r.hashedPassword;
    delete r.refreshToken;
    delete r.resetToken;
    delete r.verificationToken;
  }
});

UserSchema.virtual('name').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

UserSchema.set('toObject', { virtuals: true });

export const User = mongoose.model<IUser>('User', UserSchema);
