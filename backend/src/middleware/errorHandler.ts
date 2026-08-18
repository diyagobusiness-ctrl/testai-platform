import { Request, Response, NextFunction } from 'express'
import { logger } from '../utils/logger'

export class AppError extends Error {
  statusCode: number
  isOperational: boolean

  constructor(message: string, statusCode: number, isOperational = true) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = isOperational
    Object.setPrototypeOf(this, AppError.prototype)
  }
}

export class ValidationError extends AppError {
  errors: Record<string, string[]>

  constructor(message: string, errors: Record<string, string[]>) {
    super(message, 400)
    this.errors = errors
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Authentication failed') {
    super(message, 401)
  }
}

export class AuthorizationError extends AppError {
  constructor(message = 'Access denied') {
    super(message, 403)
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404)
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource already exists') {
    super(message, 409)
  }
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof ValidationError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
      details: err.errors,
    })
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
    })
  }

  // Log unexpected errors
  logger.error('Unexpected error:', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  })

  // Send generic error message in production
  const statusCode = 500
  const message = process.env.NODE_ENV === 'production'
    ? 'An unexpected error occurred'
    : err.message

  res.status(statusCode).json({
    success: false,
    error: message,
  })
}

// Async handler wrapper to catch async errors in Express routes
export const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

export default errorHandler
