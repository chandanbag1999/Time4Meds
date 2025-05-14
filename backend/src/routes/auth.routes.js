import express from 'express';
import { register, login, forgotPassword, verifyResetToken, resetPassword } from '../controllers/auth.controller.js';
import { validateRegister, validateLogin } from '../middleware/validate.js';

const router = express.Router();

// Register a new user
router.post('/register', validateRegister, register);

// Login user
router.post('/login', validateLogin, login);

// Forgot password - send reset email
router.post('/forgot-password', forgotPassword);

// Verify reset token
router.post('/verify-reset-token', verifyResetToken);

// Reset password with token
router.post('/reset-password', resetPassword);

export default router; 