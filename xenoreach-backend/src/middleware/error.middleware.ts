import { Request, Response, NextFunction } from 'express';
import { errorResponse } from '../shared/types/api-response.types';
import { env } from '../config/env';

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export function errorMiddleware(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json(errorResponse(err.message));
    return;
  }

  if (env.NODE_ENV === 'development') {
    console.error('[ERROR]', err);
  }

  res.status(500).json(errorResponse('An unexpected error occurred'));
}
