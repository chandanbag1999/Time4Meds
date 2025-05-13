import express from 'express';
import { 
  getAllMedicines, 
  getMedicine, 
  createMedicine, 
  updateMedicine, 
  deleteMedicine 
} from '../controllers/medicine.controller.js';

const router = express.Router();

// Get all medicines
router.get('/', getAllMedicines);

// Get a single medicine
router.get('/:id', getMedicine);

// Create a new medicine
router.post('/', createMedicine);

// Update a medicine
router.put('/:id', updateMedicine);

// Delete a medicine
router.delete('/:id', deleteMedicine);

export default router; 