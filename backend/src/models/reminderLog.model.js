import mongoose from 'mongoose';

const reminderLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  medicineId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Medicine',
    required: true,
    index: true
  },
  time: {
    type: String,
    required: true,
    match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be in HH:MM format (24-hour)']
  },
  status: {
    type: String,
    enum: ['pending', 'taken', 'skipped', 'missed'],
    default: 'pending',
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Compound index for faster queries by user and date range
reminderLogSchema.index({ userId: 1, timestamp: 1 });
reminderLogSchema.index({ medicineId: 1, timestamp: 1 });

// Virtual for date (YYYY-MM-DD) extracted from timestamp
reminderLogSchema.virtual('date').get(function() {
  return this.timestamp.toISOString().split('T')[0];
});

// Allow virtuals in JSON
reminderLogSchema.set('toJSON', { virtuals: true });
reminderLogSchema.set('toObject', { virtuals: true });

// Static method to get logs for a user within a date range
reminderLogSchema.statics.getLogsByDateRange = async function(userId, startDate, endDate) {
  return this.find({
    userId,
    timestamp: {
      $gte: startDate,
      $lte: endDate
    }
  }).sort({ timestamp: -1 });
};

// Static method to get summary statistics
reminderLogSchema.statics.getSummaryStats = async function(userId, startDate, endDate) {
  const logs = await this.find({
    userId,
    timestamp: {
      $gte: startDate,
      $lte: endDate
    }
  });
  
  const total = logs.length;
  const taken = logs.filter(log => log.status === 'taken').length;
  const skipped = logs.filter(log => log.status === 'skipped').length;
  const missed = logs.filter(log => log.status === 'missed').length;
  
  return {
    total,
    taken,
    skipped,
    missed,
    adherenceRate: total > 0 ? (taken / total) * 100 : 0
  };
};

const ReminderLog = mongoose.model('ReminderLog', reminderLogSchema);

export default ReminderLog; 