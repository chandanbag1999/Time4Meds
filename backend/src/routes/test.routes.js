import express from 'express';
import mongoose from 'mongoose';
import asyncHandler from '../middleware/asyncHandler.js';

const router = express.Router();

// Success response
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Test route working',
    data: { time: new Date().toISOString() }
  });
});

// Validation error
router.get('/validation-error', (req, res, next) => {
  const error = new mongoose.Error.ValidationError();
  error.errors = {
    name: new mongoose.Error.ValidatorError({ message: 'Name is required', path: 'name' }),
    email: new mongoose.Error.ValidatorError({ message: 'Invalid email format', path: 'email' })
  };
  next(error);
});

// Database cast error
router.get('/db-error', (req, res, next) => {
  next(new mongoose.Error.CastError('ObjectId', 'invalidid', '_id'));
});

// Duplicate key error
router.get('/duplicate-error', (req, res, next) => {
  const error = new Error('Duplicate key error');
  error.code = 11000;
  error.keyValue = { email: 'test@example.com' };
  next(error);
});

// Async error handling
router.get('/async-error', asyncHandler(async () => {
  throw new Error('Async operation failed');
}));

// Server error
router.get('/server-error', (req, res, next) => {
  next(new Error('Internal server error example'));
});

export default router; 