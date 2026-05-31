import mongoose, { Schema, Document } from 'mongoose';
import { uuidv7 } from 'uuidv7';

export interface ICourse extends Document {
  _id: any;
  title: string;
  description: string;
  category: string;
  price: number;
  isPublished: boolean;
  instructorId: string;
  createdAt: Date;
  updatedAt: Date;
}

const CourseSchema = new Schema<ICourse>({
  _id: { type: String, default: uuidv7 },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, default: 'Uncategorized' },
  price: { type: Number, default: 0.0 },
  isPublished: { type: Boolean, default: false },
  instructorId: { type: String, ref: 'User', required: true },
}, { timestamps: true });

CourseSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    const r = ret as any;
    delete r._id;
    delete r.__v;
  }
});

CourseSchema.set('toObject', { virtuals: true });

export const Course = mongoose.model<ICourse>('Course', CourseSchema);
