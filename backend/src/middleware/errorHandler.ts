import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';

export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  return sendError(res, `Route ${req.originalUrl} not found`, 404);
};

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Unhandled Error:', err);

  if (err.name === 'ZodError') {
    return sendError(res, 'Validation failed', 400, err.errors);
  }

  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return sendError(res, 'Invalid or expired token', 401);
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  return sendError(res, message, statusCode, process.env.NODE_ENV === 'development' ? err.stack : undefined);
};
