import mongoose, { Schema, Document } from 'mongoose';
import { uuidv7 } from 'uuidv7';

export interface IOption {
  _id: string;
  text: string;
  isCorrect: boolean;
}

export interface IQuestion {
  _id: string;
  text: string;
  order: number;
  options: IOption[];
}

export interface IQuiz extends Document {
  _id: string;
  lessonId: string;
  title: string;
  passingScore: number;
  questions: IQuestion[];
  createdAt: Date;
}

const OptionSchema = new Schema<IOption>({
  _id: { type: String, default: uuidv7 },
  text: { type: String, required: true },
  isCorrect: { type: Boolean, default: false },
});

const QuestionSchema = new Schema<IQuestion>({
  _id: { type: String, default: uuidv7 },
  text: { type: String, required: true },
  order: { type: Number, default: 0 },
  options: [OptionSchema],
});

const QuizSchema = new Schema<IQuiz>({
  _id: { type: String, default: uuidv7 },
  lessonId: { type: String, ref: 'Lesson', required: true, unique: true },
  title: { type: String, required: true },
  passingScore: { type: Number, default: 70 },
  questions: [QuestionSchema],
  createdAt: { type: Date, default: Date.now },
});

QuizSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    if (ret.questions) {
      ret.questions = ret.questions.map((q: any) => {
        q.id = q._id;
        delete q._id;
        if (q.options) {
          q.options = q.options.map((o: any) => {
            o.id = o._id;
            delete o._id;
            return o;
          });
        }
        return q;
      });
    }
  }
});

QuizSchema.set('toObject', { virtuals: true });

export const Quiz = mongoose.model<IQuiz>('Quiz', QuizSchema);
