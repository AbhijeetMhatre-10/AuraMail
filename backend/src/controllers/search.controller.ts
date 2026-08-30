import { Request, Response, NextFunction } from 'express';
import { SearchService } from '../services/search.service.js';
import { sendSuccess } from '../utils/response.js';

export class SearchController {
  static async search(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const q = (req.query.q as string) || '';
      const category = req.query.category as string | undefined;
      const priority = req.query.priority as string | undefined;
      const unreadOnly = req.query.unreadOnly === 'true';

      const results = await SearchService.searchEmails(
        user.id,
        q,
        { category, priority, unreadOnly },
        user.isDemoUser
      );

      return sendSuccess(res, results);
    } catch (error) {
      next(error);
    }
  }

  static async smartSearch(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const q = (req.query.q as string) || '';
      const results = await SearchService.smartSearch(user.id, q, user.isDemoUser);
      return sendSuccess(res, results);
    } catch (error) {
      next(error);
    }
  }
}
