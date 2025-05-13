import express from 'express';
import { 
  getAllMedicines, 
  getMedicine, 
  createMedicine, 
  updateMedicine, 
  deleteMedicine 
} from '../controllers/medicine.controller.js';
import { protect } from '../middleware/auth.js';
import { validateMedicine } from '../middleware/validate.js';

const router = express.Router();

// Protected routes - require authentication
router.use(protect);

// Get all medicines for authenticated user
router.get('/', getAllMedicines);

// Get a single medicine by ID (only if it belongs to authenticated user)
router.get('/:id', getMedicine);
 
// Create a new medicine (with validation)
router.post('/', validateMedicine, createMedicine);

// Update a medicine (with validation)
router.put('/:id', validateMedicine, updateMedicine);

// Delete a medicine
router.delete('/:id', deleteMedicine);

// Example of a route with role-based authorization
// router.post('/admin', protect, authorize('admin'), someAdminController);

export default router; 