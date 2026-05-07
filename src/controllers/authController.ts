import { Response } from 'express';
import User, { IUser } from '../models/User';
import { generateToken, AuthRequest } from '../middleware/auth';
import { ApiError } from '../middleware/errorHandler';

export const register = async (req: AuthRequest, res: Response) => {
  try {
    const { username, email, password, confirmPassword, level } = req.body;

    // Validation
    if (!username || !email || !password || !confirmPassword) {
      throw new ApiError(400, 'Please provide all required fields');
    }

    if (password !== confirmPassword) {
      throw new ApiError(400, 'Passwords do not match');
    }

    if (password.length < 6) {
      throw new ApiError(400, 'Password must be at least 6 characters');
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ username }, { email }]
    });

    if (existingUser) {
      throw new ApiError(400, 'Username or email already exists');
    }

    // Create user
    const user = await User.create({
      username,
      email,
      password,
      level: level || 'Beginner'
    });

    const token = generateToken(user._id.toString(), user.username);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        level: user.level,
        points: user.points,
        badges: user.badges,
        completedLessons: user.completedLessons
      }
    });
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
    } else {
      res.status(500).json({ success: false, message: 'Registration failed' });
    }
  }
};

export const login = async (req: AuthRequest, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      throw new ApiError(400, 'Please provide username and password');
    }

    // Check for user
    const user = await User.findOne({ username }).select('+password');

    if (!user) {
      throw new ApiError(401, "couldn't find an account with this username");
    }

    // Check password
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      throw new ApiError(401, 'incorrect password');
    }

    const token = generateToken(user._id.toString(), user.username);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        level: user.level,
        points: user.points,
        lastScore: user.lastScore,
        badges: user.badges,
        completedLessons: user.completedLessons
      }
    });
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
    } else {
      res.status(500).json({ success: false, message: 'Login failed' });
    }
  }
};

export const getCurrentUser = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Not authenticated');
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        level: user.level,
        points: user.points,
        lastScore: user.lastScore,
        badges: user.badges,
        completedLessons: user.completedLessons
      }
    });
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
    } else {
      res.status(500).json({ success: false, message: 'Failed to fetch user' });
    }
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Not authenticated');
    }

    const { level } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { level },
      { new: true, runValidators: true }
    );

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    res.json({
      success: true,
      message: 'Profile updated',
      user: {
        id: user._id,
        username: user.username,
        level: user.level
      }
    });
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
    } else {
      res.status(500).json({ success: false, message: 'Failed to update profile' });
    }
  }
};

export const deleteAccount = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Not authenticated');
    }

    await User.findByIdAndDelete(req.user.id);

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
    } else {
      res.status(500).json({ success: false, message: 'Failed to delete account' });
    }
  }
};
