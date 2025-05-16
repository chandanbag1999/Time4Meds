import express from 'express';
import {
  createReminderLog,
  getReminderLogs,
  updateReminderLogStatus,
  getReminderStats,
  getReminderLogById
} from '../controllers/reminderLog.controller.js';
import { protect } from '../middleware/auth.js';
import { validateReminderLog, validateStatusUpdate } from '../middleware/validate.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Create a new reminder log
// POST /api/reminder-logs
router.post('/', validateReminderLog, createReminderLog);

// Get all reminder logs for the authenticated user
// GET /api/reminder-logs
// Query parameters: startDate, endDate, medicineId, status, page, limit
router.get('/', getReminderLogs);

// Get statistics for the user's reminder logs
// GET /api/reminder-logs/stats
// Query parameters: startDate, endDate
router.get('/stats', getReminderStats);

// Get a specific reminder log by ID
// GET /api/reminder-logs/:id
router.get('/:id', getReminderLogById);

// Update a reminder log status
// PUT /api/reminder-logs/:id
router.put('/:id', validateStatusUpdate, updateReminderLogStatus);

export default router; 