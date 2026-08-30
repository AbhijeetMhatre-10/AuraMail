import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service.js';
import { AppError } from '../utils/errors.js';

export interface AuthenticatedUser {
  id: string;
  email: string;
  isDemoUser?: boolean;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    let token = req.cookies?.session_token;

    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      throw AppError.unauthorized('Authentication required to access this resource.', 'AUTH_REQUIRED');
    }

    const payload = AuthService.verifySessionToken(token);
    req.user = {
      id: payload.userId,
      email: payload.email,
      isDemoUser: payload.isDemoUser,
    };

    next();
  } catch (error) {
    next(error);
  }
}
