import { Request, Response, NextFunction } from 'express';
import { EmailService } from '../services/email.service.js';
import { sendSuccess } from '../utils/response.js';

export class EmailController {
  static async listEmails(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const folder = (req.query.folder as any) || 'inbox';
      const category = req.query.category as string | undefined;
      const priority = req.query.priority as string | undefined;
      const unreadOnly = req.query.unreadOnly === 'true';
      const query = req.query.q as string | undefined;
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

      const result = await EmailService.listEmails(
        user.id,
        { folder, category, priority, unreadOnly, query, page, limit },
        user.isDemoUser
      );

      return sendSuccess(res, result.emails, 200, {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const emailId = req.params.id;
      const email = await EmailService.getEmailById(user.id, emailId, user.isDemoUser);
      return sendSuccess(res, email);
    } catch (error) {
      next(error);
    }
  }

  static async markRead(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const emailId = req.params.id;
      const email = await EmailService.setReadState(user.id, emailId, true, user.isDemoUser);
      return sendSuccess(res, email);
    } catch (error) {
      next(error);
    }
  }

  static async markUnread(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const emailId = req.params.id;
      const email = await EmailService.setReadState(user.id, emailId, false, user.isDemoUser);
      return sendSuccess(res, email);
    } catch (error) {
      next(error);
    }
  }

  static async starEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const emailId = req.params.id;
      const email = await EmailService.setStarState(user.id, emailId, true, user.isDemoUser);
      return sendSuccess(res, email);
    } catch (error) {
      next(error);
    }
  }

  static async unstarEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const emailId = req.params.id;
      const email = await EmailService.setStarState(user.id, emailId, false, user.isDemoUser);
      return sendSuccess(res, email);
    } catch (error) {
      next(error);
    }
  }

  static async archiveEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const emailId = req.params.id;
      const isArchived = req.body?.isArchived !== undefined ? Boolean(req.body.isArchived) : true;
      const email = await EmailService.archiveEmail(user.id, emailId, isArchived, user.isDemoUser);
      return sendSuccess(res, email);
    } catch (error) {
      next(error);
    }
  }

  static async unarchiveEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const emailId = req.params.id;
      const email = await EmailService.archiveEmail(user.id, emailId, false, user.isDemoUser);
      return sendSuccess(res, email);
    } catch (error) {
      next(error);
    }
  }

  static async deleteEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const emailId = req.params.id;
      const email = await EmailService.deleteEmail(user.id, emailId, user.isDemoUser);
      return sendSuccess(res, { message: 'Email deleted', email });
    } catch (error) {
      next(error);
    }
  }

  static async sendEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const { to, cc, bcc, subject, body, isHtml } = req.body;
      const sent = await EmailService.sendEmail(
        user.id,
        {
          to: Array.isArray(to) ? to : [to],
          cc: Array.isArray(cc) ? cc : cc ? [cc] : undefined,
          bcc: Array.isArray(bcc) ? bcc : bcc ? [bcc] : undefined,
          subject,
          body,
          isHtml,
        },
        user.isDemoUser
      );
      return sendSuccess(res, sent, 201);
    } catch (error) {
      next(error);
    }
  }

  static async replyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const emailId = req.params.id;
      const { body, isHtml } = req.body;
      const reply = await EmailService.sendReply(
        user.id,
        emailId,
        { body, isHtml, replyAll: false },
        user.isDemoUser
      );
      return sendSuccess(res, reply, 201);
    } catch (error) {
      next(error);
    }
  }

  static async replyAllEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const emailId = req.params.id;
      const { body, isHtml } = req.body;
      const reply = await EmailService.sendReply(
        user.id,
        emailId,
        { body, isHtml, replyAll: true },
        user.isDemoUser
      );
      return sendSuccess(res, reply, 201);
    } catch (error) {
      next(error);
    }
  }
}
