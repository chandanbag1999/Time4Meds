import { Request, Response, NextFunction } from 'express';

// Custom error class with status code
export class AppError extends Error {
  statusCode: number;
  
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Error handling middleware
export const errorHandler = (
  err: Error | AppError, 
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  console.error(`Error: ${err.message}`);
  console.error(err.stack);

  // If it's our custom AppError, use its status code, otherwise 500
  const statusCode = 'statusCode' in err ? err.statusCode : 500;
  
  res.status(statusCode).json({
    status: 'error',
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
}; 