import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors.js';
import { sendError } from '../utils/response.js';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  if (err instanceof AppError) {
    return sendError(res, err.message, err.statusCode, err.code, err.details);
  }

  // Handle generic / unexpected exceptions without leaking credentials
  console.error('Unhandled server error:', err);
  const message = process.env.NODE_ENV === 'production' ? 'An internal server error occurred.' : err.message || 'Internal server error';

  return sendError(res, message, 500, 'INTERNAL_ERROR');
}
