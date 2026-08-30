import { Request, Response, NextFunction } from 'express';
import { ActivityService } from '../services/activity.service.js';
import { AuthService } from '../services/auth.service.js';
import { SyncService } from '../services/sync.service.js';
import { sendSuccess } from '../utils/response.js';

export class ActivityController {
  static async getActivity(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
      const activities = await ActivityService.getActivity(user.id, limit, user.isDemoUser);
      return sendSuccess(res, activities);
    } catch (error) {
      next(error);
    }
  }

  static async getAccount(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const data = await AuthService.getMe(user.id, user.isDemoUser);
      return sendSuccess(res, data.account);
    } catch (error) {
      next(error);
    }
  }

  static async syncAccount(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      if (user.isDemoUser) {
        return sendSuccess(res, { syncedCount: 6, newCount: 0, message: 'Demo mailbox is up to date.' });
      }

      const result = await SyncService.syncMailbox(user.id);
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  static async disconnectAccount(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const result = await AuthService.disconnectAccount(user.id, user.isDemoUser);
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }
}
