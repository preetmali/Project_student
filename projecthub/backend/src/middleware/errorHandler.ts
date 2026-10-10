import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { env } from '../config/env';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
      code: err.code,
      statusCode: err.statusCode,
    });
  }

  console.error('[ProjectHub Error Log]:', err);

  const statusCode = 500;
  const message = env.NODE_ENV === 'production' ? 'Internal server error.' : err.message;

  return res.status(statusCode).json({
    error: message,
    code: 'INTERNAL_SERVER_ERROR',
    statusCode,
  });
}
