import mongoose, { Schema, Document } from 'mongoose';

export interface ILesson extends Document {
  title: string;
  description: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  duration: string;
  type: 'theory' | 'quiz' | 'simulation';
  content: any;
  createdAt: Date;
  updatedAt: Date;
}

const lessonSchema = new Schema<ILesson>(
  {
    title: {
      type: String,
      required: [true, 'Please provide a lesson title']
    },
    description: {
      type: String,
      required: [true, 'Please provide a description']
    },
    level: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
      required: [true, 'Please specify a level']
    },
    duration: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['theory', 'quiz', 'simulation'],
      required: true
    },
    content: {
      type: Schema.Types.Mixed,
      required: true
    }
  },
  { timestamps: true }
);

export default mongoose.model<ILesson>('Lesson', lessonSchema);
