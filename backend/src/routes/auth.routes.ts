import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { authLimiter } from '../middleware/rateLimit.middleware.js';

const router = Router();

router.get('/google/start', authLimiter, AuthController.getGoogleAuthUrl);
router.get('/google/callback', AuthController.handleGoogleCallback);
router.post('/demo-login', authLimiter, AuthController.demoLogin);
router.get('/me', requireAuth, AuthController.getMe);
router.post('/logout', requireAuth, AuthController.logout);

export const authRoutes = router;
