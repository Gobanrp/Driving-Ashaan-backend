import mongoose, { Schema, Document } from 'mongoose';

export interface IProgress extends Document {
  userId: string;
  lessonId: string;
  completed: boolean;
  score: number;
  attempts: number;
  timeSpent: number; // in seconds
  createdAt: Date;
  updatedAt: Date;
}

const progressSchema = new Schema<IProgress>(
  {
    userId: {
      type: String,
      required: true,
      index: true
    },
    lessonId: {
      type: String,
      required: true,
      index: true
    },
    completed: {
      type: Boolean,
      default: false
    },
    score: {
      type: Number,
      default: 0
    },
    attempts: {
      type: Number,
      default: 0
    },
    timeSpent: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

// Compound index for faster queries
progressSchema.index({ userId: 1, lessonId: 1 });

export default mongoose.model<IProgress>('Progress', progressSchema);
