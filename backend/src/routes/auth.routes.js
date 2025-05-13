import express from 'express';
import { register, login } from '../controllers/auth.controller.js';
import { validateRegister, validateLogin } from '../middleware/validate.js';

const router = express.Router();

// Register a new user
router.post('/register', validateRegister, register);

// Login user
router.post('/login', validateLogin, login);

export default router; 