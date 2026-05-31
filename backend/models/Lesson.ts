import mongoose, { Schema, Document } from 'mongoose';
import { uuidv7 } from 'uuidv7';

export interface ILesson extends Document {
  _id: string;
  title: string;
  content?: string;
  videoUrl?: string;
  isFreePreview: boolean;
  orderIndex: number;
  courseId: string;
  createdAt: Date;
  updatedAt: Date;
}

const LessonSchema = new Schema<ILesson>({
  _id: { type: String, default: uuidv7 },
  title: { type: String, required: true },
  content: { type: String },
  videoUrl: { type: String },
  isFreePreview: { type: Boolean, default: false },
  orderIndex: { type: Number, default: 0 },
  courseId: { type: String, ref: 'Course', required: true },
}, { timestamps: true });

LessonSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  }
});

LessonSchema.set('toObject', { virtuals: true });

export const Lesson = mongoose.model<ILesson>('Lesson', LessonSchema);
