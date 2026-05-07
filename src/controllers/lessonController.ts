import { Response } from 'express';
import Lesson from '../models/Lesson';
import { AuthRequest } from '../middleware/auth';
import { ApiError } from '../middleware/errorHandler';

export const getAllLessons = async (req: AuthRequest, res: Response) => {
  try {
    const { level, type } = req.query;
    
    const filter: any = {};
    if (level) filter.level = level;
    if (type) filter.type = type;

    const lessons = await Lesson.find(filter);

    res.json({
      success: true,
      count: lessons.length,
      data: lessons
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch lessons' });
  }
};

export const getLessonById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const lesson = await Lesson.findById(id);

    if (!lesson) {
      throw new ApiError(404, 'Lesson not found');
    }

    res.json({
      success: true,
      data: lesson
    });
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
    } else {
      res.status(500).json({ success: false, message: 'Failed to fetch lesson' });
    }
  }
};

export const createLesson = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, level, duration, type, content } = req.body;

    if (!title || !description || !level || !duration || !type || !content) {
      throw new ApiError(400, 'Please provide all required fields');
    }

    const lesson = await Lesson.create({
      title,
      description,
      level,
      duration,
      type,
      content
    });

    res.status(201).json({
      success: true,
      message: 'Lesson created successfully',
      data: lesson
    });
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
    } else {
      res.status(500).json({ success: false, message: 'Failed to create lesson' });
    }
  }
};

export const updateLesson = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const lesson = await Lesson.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!lesson) {
      throw new ApiError(404, 'Lesson not found');
    }

    res.json({
      success: true,
      message: 'Lesson updated successfully',
      data: lesson
    });
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
    } else {
      res.status(500).json({ success: false, message: 'Failed to update lesson' });
    }
  }
};

export const deleteLesson = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const lesson = await Lesson.findByIdAndDelete(id);

    if (!lesson) {
      throw new ApiError(404, 'Lesson not found');
    }

    res.json({
      success: true,
      message: 'Lesson deleted successfully'
    });
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
    } else {
      res.status(500).json({ success: false, message: 'Failed to delete lesson' });
    }
  }
};

export const getLessonsByLevel = async (req: AuthRequest, res: Response) => {
  try {
    const { level } = req.params;

    const lessons = await Lesson.find({ level });

    res.json({
      success: true,
      count: lessons.length,
      data: lessons
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch lessons' });
  }
};
