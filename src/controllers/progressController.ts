import { Response } from 'express';
import Progress from '../models/Progress';
import QuizAttempt from '../models/QuizAttempt';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';
import { ApiError } from '../middleware/errorHandler';

export const getUserProgress = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Not authenticated');
    }

    const progress = await Progress.find({ userId: req.user.id });

    res.json({
      success: true,
      count: progress.length,
      data: progress
    });
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
    } else {
      res.status(500).json({ success: false, message: 'Failed to fetch progress' });
    }
  }
};

export const getLessonProgress = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Not authenticated');
    }

    const { lessonId } = req.params;

    const progress = await Progress.findOne({
      userId: req.user.id,
      lessonId
    });

    res.json({
      success: true,
      data: progress || { completed: false, score: 0, attempts: 0 }
    });
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
    } else {
      res.status(500).json({ success: false, message: 'Failed to fetch lesson progress' });
    }
  }
};

export const markLessonComplete = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Not authenticated');
    }

    const { lessonId } = req.params;
    const { score, timeSpent } = req.body;

    let progress = await Progress.findOne({
      userId: req.user.id,
      lessonId
    });

    if (!progress) {
      progress = new Progress({
        userId: req.user.id,
        lessonId,
        completed: true,
        score: score || 0,
        attempts: 1,
        timeSpent: timeSpent || 0
      });
    } else {
      progress.completed = true;
      progress.score = score || progress.score;
      progress.attempts = (progress.attempts || 0) + 1;
      progress.timeSpent = (progress.timeSpent || 0) + (timeSpent || 0);
    }

    await progress.save();

    // Update user profile if lesson is new
    const user = await User.findById(req.user.id);
    if (user && !user.completedLessons.includes(lessonId)) {
      user.completedLessons.push(lessonId);
      user.points = (user.points || 0) + (score || 10);
      user.lastScore = score || 0;
      await user.save();
    }

    res.json({
      success: true,
      message: 'Lesson marked as completed',
      data: progress
    });
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
    } else {
      res.status(500).json({ success: false, message: 'Failed to update progress' });
    }
  }
};

export const submitQuizAttempt = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Not authenticated');
    }

    const { lessonId, score, totalQuestions, correctAnswers, answers, timeTaken } = req.body;

    if (score === undefined || totalQuestions === undefined || correctAnswers === undefined) {
      throw new ApiError(400, 'Please provide all required fields');
    }

    const quizAttempt = await QuizAttempt.create({
      userId: req.user.id,
      lessonId,
      score,
      totalQuestions,
      correctAnswers,
      answers: answers || [],
      timeTaken: timeTaken || 0
    });

    // Update user progress
    let progress = await Progress.findOne({
      userId: req.user.id,
      lessonId
    });

    if (!progress) {
      progress = new Progress({
        userId: req.user.id,
        lessonId,
        completed: score >= 70, // Mark as completed if score >= 70%
        score,
        attempts: 1
      });
    } else {
      progress.completed = score >= 70;
      progress.score = Math.max(progress.score, score);
      progress.attempts = (progress.attempts || 0) + 1;
    }

    await progress.save();

    // Update user profile
    const user = await User.findById(req.user.id);
    if (user) {
      if (!user.completedLessons.includes(lessonId) && score >= 70) {
        user.completedLessons.push(lessonId);
      }
      user.lastScore = score;
      user.points = (user.points || 0) + Math.floor(score / 10);
      await user.save();
    }

    res.status(201).json({
      success: true,
      message: 'Quiz attempt submitted',
      data: {
        attempt: quizAttempt,
        progress,
        passed: score >= 70
      }
    });
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
    } else {
      res.status(500).json({ success: false, message: 'Failed to submit quiz attempt' });
    }
  }
};

export const getQuizAttempts = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Not authenticated');
    }

    const { lessonId } = req.params;

    const attempts = await QuizAttempt.find({
      userId: req.user.id,
      lessonId
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: attempts.length,
      data: attempts
    });
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
    } else {
      res.status(500).json({ success: false, message: 'Failed to fetch quiz attempts' });
    }
  }
};

export const getUserStats = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Not authenticated');
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    const totalLessons = await Progress.countDocuments({ userId: req.user.id });
    const completedLessons = user.completedLessons.length;
    const quizAttempts = await QuizAttempt.countDocuments({ userId: req.user.id });
    const averageScore = await getAverageScore(req.user.id);

    res.json({
      success: true,
      data: {
        username: user.username,
        level: user.level,
        points: user.points,
        badges: user.badges,
        lastScore: user.lastScore,
        totalLessonsAttempted: totalLessons,
        completedLessons,
        quizAttempts,
        averageScore: Math.round(averageScore * 100) / 100
      }
    });
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
    } else {
      res.status(500).json({ success: false, message: 'Failed to fetch stats' });
    }
  }
};

const getAverageScore = async (userId: string): Promise<number> => {
  const attempts = await QuizAttempt.find({ userId });
  if (attempts.length === 0) return 0;
  const totalScore = attempts.reduce((sum, attempt) => sum + attempt.score, 0);
  return totalScore / attempts.length;
};
