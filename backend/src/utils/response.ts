import { Response } from 'express';
import { ErrorCode } from './errors.js';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: ErrorCode;
    message: string;
    details?: any;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    nextCursor?: string;
    [key: string]: any;
  };
}

export function sendSuccess<T>(res: Response, data: T, statusCode = 200, meta?: ApiResponse['meta']) {
  const payload: ApiResponse<T> = {
    success: true,
    data,
    ...(meta ? { meta } : {}),
  };
  return res.status(statusCode).json(payload);
}

export function sendError(
  res: Response,
  message: string,
  statusCode = 500,
  code: ErrorCode = 'INTERNAL_ERROR',
  details?: any
) {
  const payload: ApiResponse = {
    success: false,
    error: {
      code,
      message,
      ...(details !== undefined ? { details } : {}),
    },
  };
  return res.status(statusCode).json(payload);
}
