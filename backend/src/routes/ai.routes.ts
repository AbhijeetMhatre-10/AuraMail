import { Router } from 'express';
import { AIController } from '../controllers/ai.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { aiLimiter } from '../middleware/rateLimit.middleware.js';
import { validateBody } from '../middleware/validation.middleware.js';
import { z } from 'zod';

const router = Router();

router.use(requireAuth);
router.use(aiLimiter);

const summarizeSchema = z.object({
  emailId: z.string().min(1, 'emailId is required'),
});

const replySchema = z.object({
  emailId: z.string().optional(),
  originalSender: z.string().optional(),
  originalSubject: z.string().optional(),
  originalBody: z.string().optional(),
  tone: z.enum(['Professional', 'Friendly', 'Formal', 'Concise']).optional(),
  userInstructions: z.string().optional(),
});

const rewriteSchema = z.object({
  text: z.string().min(1, 'Text is required to rewrite'),
  tone: z.enum(['Professional', 'Friendly', 'Formal', 'Concise']).default('Professional'),
  instruction: z.string().optional(),
});

const subjectSchema = z.object({
  body: z.string().min(1, 'Email body is required'),
  currentSubject: z.string().optional(),
});

const voicePolishSchema = z.object({
  transcript: z.string().min(1, 'Spoken transcript is required'),
});

router.post('/summarize', validateBody(summarizeSchema), AIController.summarize);
router.post('/reply', validateBody(replySchema), AIController.reply);
router.post('/classify', validateBody(summarizeSchema), AIController.classify);
router.post('/analyze', validateBody(summarizeSchema), AIController.analyze);
router.post('/priority', validateBody(summarizeSchema), AIController.priority);
router.post('/spam-phishing', validateBody(summarizeSchema), AIController.spamPhishing);
router.post('/subject', validateBody(subjectSchema), AIController.generateSubject);
router.post('/rewrite', validateBody(rewriteSchema), AIController.rewrite);
router.post('/explain', validateBody(summarizeSchema), AIController.explain);
router.post('/categorize', validateBody(summarizeSchema), AIController.categorize);
router.post('/voice-polish', validateBody(voicePolishSchema), AIController.voicePolish);
router.get('/history', AIController.history);

export const aiRoutes = router;
