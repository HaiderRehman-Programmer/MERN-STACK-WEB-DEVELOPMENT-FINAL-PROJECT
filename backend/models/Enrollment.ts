import mongoose, { Schema, Document } from 'mongoose';
import { uuidv7 } from 'uuidv7';

export interface IEnrollment extends Document {
  _id: any;
  studentId: string;
  courseId: string;
  status: 'ACTIVE' | 'COMPLETED' | 'DROPPED';
  progress: number;
  purchasedAt: Date;
}

const EnrollmentSchema = new Schema<IEnrollment>({
  _id: { type: String, default: uuidv7 },
  studentId: { type: String, ref: 'User', required: true },
  courseId: { type: String, ref: 'Course', required: true },
  status: { type: String, enum: ['ACTIVE', 'COMPLETED', 'DROPPED'], default: 'ACTIVE' },
  progress: { type: Number, default: 0, min: 0, max: 100 },
  purchasedAt: { type: Date, default: Date.now },
}, { timestamps: true });

EnrollmentSchema.index({ studentId: 1, courseId: 1 }, { unique: true });
EnrollmentSchema.index({ purchasedAt: 1 });

EnrollmentSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    const r = ret as any;
    delete r._id;
    delete r.__v;
  }
});

EnrollmentSchema.set('toObject', { virtuals: true });

export const Enrollment = mongoose.model<IEnrollment>('Enrollment', EnrollmentSchema);
