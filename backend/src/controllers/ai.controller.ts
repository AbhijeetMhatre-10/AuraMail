import { Request, Response, NextFunction } from 'express';
import { AIService } from '../services/ai.service.js';
import { sendSuccess } from '../utils/response.js';

export class AIController {
  static async summarize(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const { emailId } = req.body;
      const result = await AIService.summarize(user.id, emailId, user.isDemoUser);
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  static async reply(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const { emailId, originalSender, originalSubject, originalBody, tone, userInstructions } = req.body;
      const result = await AIService.generateReply(
        user.id,
        {
          emailId,
          originalSender: originalSender || '',
          originalSubject: originalSubject || '',
          originalBody: originalBody || '',
          tone,
          userInstructions,
        },
        user.isDemoUser
      );
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  static async classify(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const { emailId } = req.body;
      const result = await AIService.classify(user.id, emailId, user.isDemoUser);
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  static async analyze(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const { emailId } = req.body;
      // Combines priority, classification, and spam/phishing analysis
      const [priorityRes, classifyRes, spamRes, explainRes] = await Promise.all([
        AIService.analyzePriority(user.id, emailId, user.isDemoUser),
        AIService.classify(user.id, emailId, user.isDemoUser),
        AIService.analyzeSpamPhishing(user.id, emailId, user.isDemoUser),
        AIService.explainEmail(user.id, emailId, user.isDemoUser),
      ]);

      return sendSuccess(res, {
        priority: priorityRes,
        classification: classifyRes,
        security: spamRes,
        explanation: explainRes,
      });
    } catch (error) {
      next(error);
    }
  }

  static async priority(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const { emailId } = req.body;
      const result = await AIService.analyzePriority(user.id, emailId, user.isDemoUser);
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  static async spamPhishing(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const { emailId } = req.body;
      const result = await AIService.analyzeSpamPhishing(user.id, emailId, user.isDemoUser);
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  static async generateSubject(req: Request, res: Response, next: NextFunction) {
    try {
      const { body, currentSubject } = req.body;
      const subjects = await AIService.generateSubjectLines(body || '', currentSubject);
      return sendSuccess(res, { subjects });
    } catch (error) {
      next(error);
    }
  }

  static async rewrite(req: Request, res: Response, next: NextFunction) {
    try {
      const { text, tone, instruction } = req.body;
      const result = await AIService.rewrite({
        text,
        tone: tone || 'Professional',
        instruction,
      });
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  static async explain(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const { emailId } = req.body;
      const result = await AIService.explainEmail(user.id, emailId, user.isDemoUser);
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  static async categorize(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const { emailId } = req.body;
      const result = await AIService.classify(user.id, emailId, user.isDemoUser);
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  static async voicePolish(req: Request, res: Response, next: NextFunction) {
    try {
      const { transcript } = req.body;
      const result = await AIService.polishVoiceTranscript(transcript || '');
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  static async history(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const history = await AIService.getAIHistory(user.id, user.isDemoUser);
      return sendSuccess(res, history);
    } catch (error) {
      next(error);
    }
  }
}
