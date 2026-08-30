import { Router } from 'express';
import { ActivityController } from '../controllers/activity.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.use(requireAuth);

router.get('/activity', ActivityController.getActivity);
router.get('/account', ActivityController.getAccount);
router.post('/account/sync', ActivityController.syncAccount);
router.delete('/account', ActivityController.disconnectAccount);

export const activityRoutes = router;
