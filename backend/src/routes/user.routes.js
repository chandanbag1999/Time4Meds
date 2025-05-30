import express from 'express';
import {
  getCurrentUser,
  getAllUsers,
  updateUserRole,
  addCaregiver,
  removeCaregiver,
  updateCaregiverSettings,
  getCaregivers,
  getCaregivingFor,
  updatePreferences
} from '../controllers/user.controller.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/me', getCurrentUser);

// User preferences
router.put('/preferences', updatePreferences);

// Caregiver routes
router.get('/caregivers', getCaregivers);
router.post('/caregivers', addCaregiver);
router.put('/caregivers/:caregiverId', updateCaregiverSettings);
router.delete('/caregivers/:caregiverId', removeCaregiver);

// Caregiving for routes
router.get('/caregiving', getCaregivingFor);

// Routes accessible only to admin role
router.get('/', authorize('admin'), getAllUsers);
router.put('/role', authorize('admin'), updateUserRole);

export default router;