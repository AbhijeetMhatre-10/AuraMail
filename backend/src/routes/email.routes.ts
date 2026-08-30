import { Router } from 'express';
import { EmailController } from '../controllers/email.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validation.middleware.js';
import { z } from 'zod';

const router = Router();

// Apply authentication to all email routes
router.use(requireAuth);

const sendEmailSchema = z.object({
  to: z.union([z.string().email(), z.array(z.string().email())]),
  cc: z.union([z.string().email(), z.array(z.string().email())]).optional(),
  bcc: z.union([z.string().email(), z.array(z.string().email())]).optional(),
  subject: z.string().min(1, 'Subject is required'),
  body: z.string().min(1, 'Body is required'),
  isHtml: z.boolean().optional(),
});

const replySchema = z.object({
  body: z.string().min(1, 'Reply message body is required'),
  isHtml: z.boolean().optional(),
});

router.get('/', EmailController.listEmails);
router.post('/send', validateBody(sendEmailSchema), EmailController.sendEmail);

router.get('/:id', EmailController.getEmail);
router.post('/:id/read', EmailController.markRead);
router.post('/:id/unread', EmailController.markUnread);
router.post('/:id/star', EmailController.starEmail);
router.delete('/:id/star', EmailController.unstarEmail);
router.post('/:id/archive', EmailController.archiveEmail);
router.post('/:id/unarchive', EmailController.unarchiveEmail);
router.delete('/:id/archive', EmailController.unarchiveEmail);
router.delete('/:id', EmailController.deleteEmail);

router.post('/:id/reply', validateBody(replySchema), EmailController.replyEmail);
router.post('/:id/reply-all', validateBody(replySchema), EmailController.replyAllEmail);

export const emailRoutes = router;
