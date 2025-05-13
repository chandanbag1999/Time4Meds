import express from 'express';
import { logMedicineReminder } from '../controllers/reminderLog.controller.js';
import { protect } from '../middleware/auth.js';
import { validateQuickLog } from '../middleware/validate.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

/**
 * @route   POST /api/reminders/log
 * @desc    Log a medicine reminder (taken, skipped, etc.)
 * @access  Private
 * @body    {medicineId, time (optional), status (optional)}
 * @returns {success, message, data}
 * 
 * medicineId: ID of the medicine (required)
 * time: Time in HH:MM format (optional, defaults to current time)
 * status: 'pending', 'taken', 'skipped', 'missed' (optional, defaults to 'taken')
 */
router.post('/log', validateQuickLog, logMedicineReminder);

export default router; 