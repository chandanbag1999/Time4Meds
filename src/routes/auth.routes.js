import express from 'express';
import { register } from '../controllers/auth.controller.js';
import { validateRegister } from '../middleware/validate.js';

const router = express.Router();

// Register a new user
router.post('/register', validateRegister, register);

export default router; 