import { Request, Response, NextFunction } from 'express';
import { ThreadService } from '../services/thread.service.js';
import { sendSuccess } from '../utils/response.js';

export class ThreadController {
  static async getThread(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const threadId = req.params.id;
      const thread = await ThreadService.getThread(user.id, threadId, user.isDemoUser);
      return sendSuccess(res, thread);
    } catch (error) {
      next(error);
    }
  }
}
