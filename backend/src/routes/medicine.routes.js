import express from 'express';
import { 
  getAllMedicines, 
  getMedicine, 
  createMedicine, 
  updateMedicine, 
  deleteMedicine 
} from '../controllers/medicine.controller.js';
import { protect } from '../middleware/auth.js';
import { validateMedicine, validateMedicineUpdate } from '../middleware/validate.js';
import { parseMedicineQuery } from '../middleware/query.js';
import { logOperation } from '../middleware/log.js';

const router = express.Router();

// Protected routes - require authentication
router.use(protect);

// Get all medicines for authenticated user
// Supports: sorting, pagination, and filtering
// Example: GET /api/medicines?isActive=true&frequency=daily&sort=-createdAt&page=1&limit=10
router.get('/', parseMedicineQuery, getAllMedicines);

// Get a single medicine by ID (only if it belongs to authenticated user)
router.get('/:id', getMedicine);
 
// Create a new medicine (with validation)
router.post('/', validateMedicine, createMedicine);

// Update a medicine (with partial update validation)
router.put('/:id', validateMedicineUpdate, updateMedicine);

// Delete a medicine by ID
// DELETE /api/medicines/:id
// Protected: Yes - requires authentication
// Description: Deletes a medicine if it belongs to the authenticated user
// Response: Success message with ID and name of deleted medicine
router.delete('/:id', logOperation('MEDICINE_DELETE'), deleteMedicine);

// Example of a route with role-based authorization
// router.post('/admin', protect, authorize('admin'), someAdminController);

export default router; 