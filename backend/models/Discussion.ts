import mongoose, { Schema, Document } from 'mongoose';
import { uuidv7 } from 'uuidv7';

export interface IDiscussionReply extends Document {
  _id: string;
  discussionId: string;
  userId: string;
  content: string;
  createdAt: Date;
}

const DiscussionReplySchema = new Schema<IDiscussionReply>({
  _id: { type: String, default: uuidv7 },
  discussionId: { type: String, ref: 'Discussion', required: true },
  userId: { type: String, ref: 'User', required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

DiscussionReplySchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  }
});

DiscussionReplySchema.set('toObject', { virtuals: true });

export const DiscussionReply = mongoose.model<IDiscussionReply>('DiscussionReply', DiscussionReplySchema);

export interface IDiscussion extends Document {
  _id: string;
  lessonId: string;
  userId: string;
  content: string;
  createdAt: Date;
}

const DiscussionSchema = new Schema<IDiscussion>({
  _id: { type: String, default: uuidv7 },
  lessonId: { type: String, ref: 'Lesson', required: true },
  userId: { type: String, ref: 'User', required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Setup virtual for replies
DiscussionSchema.virtual('replies', {
  ref: 'DiscussionReply',
  localField: '_id',
  foreignField: 'discussionId'
});

DiscussionSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  }
});

DiscussionSchema.set('toObject', { virtuals: true });

export const Discussion = mongoose.model<IDiscussion>('Discussion', DiscussionSchema);
