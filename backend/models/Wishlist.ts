import mongoose, { Schema, Document } from 'mongoose';
import { uuidv7 } from 'uuidv7';

export interface IWishlist extends Document {
  _id: string;
  userId: string;
  courseId: string;
  createdAt: Date;
}

const WishlistSchema = new Schema<IWishlist>({
  _id: { type: String, default: uuidv7 },
  userId: { type: String, ref: 'User', required: true },
  courseId: { type: String, ref: 'Course', required: true },
  createdAt: { type: Date, default: Date.now },
});

WishlistSchema.index({ userId: 1, courseId: 1 }, { unique: true });

WishlistSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  }
});

WishlistSchema.set('toObject', { virtuals: true });

export const Wishlist = mongoose.model<IWishlist>('Wishlist', WishlistSchema);
