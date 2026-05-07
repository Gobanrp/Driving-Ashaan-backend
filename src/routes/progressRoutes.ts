import { Router } from 'express';
import * as progressController from '../controllers/progressController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All progress routes require authentication
router.use(authenticateToken);

// User progress
router.get('/', progressController.getUserProgress);
router.get('/lesson/:lessonId', progressController.getLessonProgress);
router.put('/lesson/:lessonId', progressController.markLessonComplete);

// Quiz attempts
router.post('/quiz/submit', progressController.submitQuizAttempt);
router.get('/quiz/:lessonId', progressController.getQuizAttempts);

// User stats
router.get('/stats/user', progressController.getUserStats);

export default router;
