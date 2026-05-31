import mongoose, { Schema, Document } from 'mongoose';
import { uuidv7 } from 'uuidv7';

export interface IQuizAttempt extends Document {
  _id: string;
  studentId: string;
  quizId: string;
  score: number;
  passed: boolean;
  createdAt: Date;
}

const QuizAttemptSchema = new Schema<IQuizAttempt>({
  _id: { type: String, default: uuidv7 },
  studentId: { type: String, ref: 'User', required: true },
  quizId: { type: String, ref: 'Quiz', required: true },
  score: { type: Number, required: true },
  passed: { type: Boolean, required: true },
  createdAt: { type: Date, default: Date.now },
});

QuizAttemptSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  }
});

QuizAttemptSchema.set('toObject', { virtuals: true });

export const QuizAttempt = mongoose.model<IQuizAttempt>('QuizAttempt', QuizAttemptSchema);
