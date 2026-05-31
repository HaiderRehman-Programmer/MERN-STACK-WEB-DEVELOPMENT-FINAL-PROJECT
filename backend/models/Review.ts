import mongoose, { Schema, Document } from 'mongoose';
import { uuidv7 } from 'uuidv7';

export interface IReview extends Document {
  _id: string;
  studentId: string;
  courseId: string;
  rating: number;
  comment?: string;
  createdAt: Date;
}

const ReviewSchema = new Schema<IReview>({
  _id: { type: String, default: uuidv7 },
  studentId: { type: String, ref: 'User', required: true },
  courseId: { type: String, ref: 'Course', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String },
  createdAt: { type: Date, default: Date.now },
});

ReviewSchema.index({ studentId: 1, courseId: 1 }, { unique: true });

ReviewSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  }
});

ReviewSchema.set('toObject', { virtuals: true });

export const Review = mongoose.model<IReview>('Review', ReviewSchema);
