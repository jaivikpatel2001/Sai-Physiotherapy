import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';

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

interface MongoError extends Error {
  code?: number;
  keyValue?: Record<string, unknown>;
}

interface ValidationError extends Error {
  errors: Record<string, { message: string }>;
}

const handleCastError = (error: Error & { path?: string; value?: unknown }): AppError => {
  return new AppError(`Invalid ${error.path}: ${error.value}`, 400);
};

const handleDuplicateKeyError = (error: MongoError): AppError => {
  const field = Object.keys(error.keyValue || {})[0];
  const value = Object.values(error.keyValue || {})[0];
  return new AppError(`Duplicate value for field '${field}': ${value}. Please use a different value.`, 409);
};

const handleValidationError = (error: ValidationError): AppError => {
  const messages = Object.values(error.errors).map((e) => e.message);
  return new AppError(`Validation failed: ${messages.join('. ')}`, 400);
};

const handleJWTError = (): AppError => new AppError('Invalid token. Please log in again.', 401);
const handleJWTExpiredError = (): AppError => new AppError('Token expired. Please log in again.', 401);

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void => {
  let error: AppError;

  if (err instanceof AppError) {
    error = err;
  } else {
    const mongoErr = err as MongoError;

    if (err.name === 'CastError') {
      error = handleCastError(err as Error & { path?: string; value?: unknown });
    } else if (mongoErr.code === 11000) {
      error = handleDuplicateKeyError(mongoErr);
    } else if (err.name === 'ValidationError') {
      error = handleValidationError(err as unknown as ValidationError);
    } else if (err.name === 'JsonWebTokenError') {
      error = handleJWTError();
    } else if (err.name === 'TokenExpiredError') {
      error = handleJWTExpiredError();
    } else {
      error = new AppError('Internal server error', 500);
    }
  }

  // Log error details (not to client in prod)
  if (error.statusCode >= 500) {
    logger.error(`[${req.method}] ${req.path} — ${err.message}`, {
      stack: err.stack,
      body: req.body,
      params: req.params,
      query: req.query,
    });
  }

  res.status(error.statusCode).json({
    success: false,
    error: error.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

/**
 * Async handler wrapper — eliminates try/catch boilerplate in controllers
 */
export const asyncHandler = <T extends Request>(
  fn: (req: T, res: Response, next: NextFunction) => Promise<void>
) => {
  return (req: T, res: Response, next: NextFunction): void => {
    fn(req, res, next).catch(next);
  };
};
