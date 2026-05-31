import mongoose, { Schema, Document } from 'mongoose';
import { uuidv7 } from 'uuidv7';

export interface ILessonProgress extends Document {
  _id: string;
  studentId: string;
  lessonId: string;
  isCompleted: boolean;
  lastWatchedSeconds: number;
  completedAt: Date;
}

const LessonProgressSchema = new Schema<ILessonProgress>({
  _id: { type: String, default: uuidv7 },
  studentId: { type: String, ref: 'User', required: true },
  lessonId: { type: String, ref: 'Lesson', required: true },
  isCompleted: { type: Boolean, default: true },
  lastWatchedSeconds: { type: Number, default: 0 },
  completedAt: { type: Date, default: Date.now },
});

LessonProgressSchema.index({ studentId: 1, lessonId: 1 }, { unique: true });
LessonProgressSchema.index({ studentId: 1, isCompleted: 1 });

LessonProgressSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  }
});

LessonProgressSchema.set('toObject', { virtuals: true });

export const LessonProgress = mongoose.model<ILessonProgress>('LessonProgress', LessonProgressSchema);
