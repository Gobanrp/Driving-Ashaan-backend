import mongoose, { Schema, Document } from 'mongoose';
import bcryptjs from 'bcryptjs';

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  completedLessons: string[];
  points: number;
  lastScore: number;
  badges: number;
  createdAt: Date;
  updatedAt: Date;
  matchPassword(enteredPassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: [true, 'Please provide a username'],
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 50
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email'
      ]
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6,
      select: false
    },
    level: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
      default: 'Beginner'
    },
    completedLessons: {
      type: [String],
      default: []
    },
    points: {
      type: Number,
      default: 0
    },
    lastScore: {
      type: Number,
      default: 0
    },
    badges: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcryptjs.genSalt(10);
    this.password = await bcryptjs.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as any);
  }
});

// Method to compare passwords
userSchema.methods.matchPassword = async function (enteredPassword: string): Promise<boolean> {
  return await bcryptjs.compare(enteredPassword, this.password);
};

export default mongoose.model<IUser>('User', userSchema);
