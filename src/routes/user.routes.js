import express from 'express';
import { 
  getCurrentUser,
  getAllUsers,
  updateUserRole
} from '../controllers/user.controller.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/me', getCurrentUser);

// Routes accessible only to admin role
router.get('/', authorize('admin'), getAllUsers);
router.put('/role', authorize('admin'), updateUserRole);

export default router; 