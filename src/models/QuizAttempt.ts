import mongoose, { Schema, Document } from 'mongoose';

export interface IQuizAttempt extends Document {
  userId: string;
  lessonId: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  answers: Array<{ questionId: string; selectedAnswer: string; isCorrect: boolean }>;
  timeTaken: number;
  createdAt: Date;
}

const quizAttemptSchema = new Schema<IQuizAttempt>(
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
    score: {
      type: Number,
      required: true
    },
    totalQuestions: {
      type: Number,
      required: true
    },
    correctAnswers: {
      type: Number,
      required: true
    },
    answers: [{
      questionId: String,
      selectedAnswer: String,
      isCorrect: Boolean
    }],
    timeTaken: {
      type: Number,
      required: true // in seconds
    }
  },
  { timestamps: true }
);

export default mongoose.model<IQuizAttempt>('QuizAttempt', quizAttemptSchema);
