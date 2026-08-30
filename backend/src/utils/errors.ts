export type ErrorCode =
  | 'AUTH_REQUIRED'
  | 'AUTH_EXPIRED'
  | 'GMAIL_API_ERROR'
  | 'AI_PROVIDER_ERROR'
  | 'VALIDATION_ERROR'
  | 'RATE_LIMITED'
  | 'NOT_FOUND'
  | 'INTERNAL_ERROR'
  | 'FORBIDDEN'
  | 'BAD_REQUEST';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: ErrorCode;
  public readonly details?: any;

  constructor(message: string, statusCode = 500, code: ErrorCode = 'INTERNAL_ERROR', details?: any) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, AppError.prototype);
  }

  static badRequest(message: string, details?: any) {
    return new AppError(message, 400, 'BAD_REQUEST', details);
  }

  static validation(message: string, details?: any) {
    return new AppError(message, 400, 'VALIDATION_ERROR', details);
  }

  static unauthorized(message = 'Authentication required', code: ErrorCode = 'AUTH_REQUIRED') {
    return new AppError(message, 401, code);
  }

  static forbidden(message = 'Access forbidden') {
    return new AppError(message, 403, 'FORBIDDEN');
  }

  static notFound(message = 'Resource not found') {
    return new AppError(message, 404, 'NOT_FOUND');
  }

  static rateLimited(message = 'Too many requests. Please try again later.') {
    return new AppError(message, 429, 'RATE_LIMITED');
  }

  static gmailError(message: string, details?: any) {
    return new AppError(message, 502, 'GMAIL_API_ERROR', details);
  }

  static aiError(message: string, details?: any) {
    return new AppError(message, 502, 'AI_PROVIDER_ERROR', details);
  }

  static internal(message = 'An unexpected internal error occurred', details?: any) {
    return new AppError(message, 500, 'INTERNAL_ERROR', details);
  }
}
