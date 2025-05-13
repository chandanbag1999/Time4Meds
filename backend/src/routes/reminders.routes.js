import express from 'express';
import { 
  logMedicineReminder,
  getUserReminderLogs
} from '../controllers/reminderLog.controller.js';
import { protect } from '../middleware/auth.js';
import { validateQuickLog, validateDateParams } from '../middleware/validate.js';

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

/**
 * @route   GET /api/reminders/log
 * @desc    Get reminder logs for the authenticated user
 * @access  Private
 * @query   {
 *            medicineId (optional): Filter logs by medicine
 *            date (optional): Filter by specific date (YYYY-MM-DD)
 *            startDate, endDate (optional): Filter by date range
 *            status (optional): Filter by status
 *            page, limit (optional): Pagination control
 *          }
 * @returns {success, count, total, pagination, data}
 */
router.get('/log', validateDateParams, getUserReminderLogs);

export default router; 