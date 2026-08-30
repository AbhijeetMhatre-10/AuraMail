import { Router } from 'express';
import { ThreadController } from '../controllers/thread.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.use(requireAuth);

router.get('/:id', ThreadController.getThread);

export const threadRoutes = router;
