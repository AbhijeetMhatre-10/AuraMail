import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service.js';
import { sendSuccess } from '../utils/response.js';
import { env } from '../config/env.js';

export class AuthController {
  static getGoogleAuthUrl(req: Request, res: Response, next: NextFunction) {
    try {
      const state = req.query.state as string | undefined;
      const url = AuthService.getGoogleAuthUrl(state);
      return sendSuccess(res, { url });
    } catch (error) {
      next(error);
    }
  }

  static async handleGoogleCallback(req: Request, res: Response, next: NextFunction) {
    try {
      const code = req.query.code as string;
      if (!code) {
        return res.redirect(`${env.CLIENT_URL}/login?error=missing_code`);
      }

      const { token } = await AuthService.handleGoogleCallback(code);

      // Set HTTP-only session cookie
      res.cookie('session_token', token, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      // Redirect back to frontend inbox
      return res.redirect(`${env.CLIENT_URL}/inbox?auth=success`);
    } catch (error: any) {
      console.error('OAuth callback failed:', error.message);
      return res.redirect(`${env.CLIENT_URL}/login?error=${encodeURIComponent(error.message || 'auth_failed')}`);
    }
  }

  static async demoLogin(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, user, isDemo } = await AuthService.loginAsDemo();

      res.cookie('session_token', token, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return sendSuccess(res, { token, user, isDemo });
    } catch (error) {
      next(error);
    }
  }

  static async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const data = await AuthService.getMe(user.id, user.isDemoUser);
      return sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  }

  static logout(req: Request, res: Response, next: NextFunction) {
    try {
      res.clearCookie('session_token', {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'lax',
      });
      return sendSuccess(res, { message: 'Logged out successfully' });
    } catch (error) {
      next(error);
    }
  }
}
