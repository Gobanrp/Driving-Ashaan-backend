import { Router } from 'express';
import * as lessonController from '../controllers/lessonController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Public routes - anyone can view lessons
router.get('/', lessonController.getAllLessons);
router.get('/:id', lessonController.getLessonById);
router.get('/level/:level', lessonController.getLessonsByLevel);

// Protected routes - admin only (in production, add admin middleware)
router.post('/', authenticateToken, lessonController.createLesson);
router.put('/:id', authenticateToken, lessonController.updateLesson);
router.delete('/:id', authenticateToken, lessonController.deleteLesson);

export default router;
