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
  scheduledTime: {
    type: Date,
    index: true
  },
  takenAt: {
    type: Date
  },
  missedAt: {
    type: Date
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

// Static method to get adherence by day of week
reminderLogSchema.statics.getAdherenceByDayOfWeek = async function(userId, startDate, endDate) {
  const logs = await this.find({
    userId,
    timestamp: {
      $gte: startDate,
      $lte: endDate
    }
  });

  // Initialize stats for each day of the week (0 = Sunday, 6 = Saturday)
  const dayStats = Array(7).fill(0).map(() => ({ total: 0, taken: 0, adherenceRate: 0 }));

  // Process logs
  logs.forEach(log => {
    const dayOfWeek = new Date(log.timestamp).getDay();
    dayStats[dayOfWeek].total++;
    if (log.status === 'taken') {
      dayStats[dayOfWeek].taken++;
    }
  });

  // Calculate adherence rates
  dayStats.forEach(day => {
    day.adherenceRate = day.total > 0 ? (day.taken / day.total) * 100 : 0;
  });

  return dayStats;
};

// Static method to get adherence by time of day
reminderLogSchema.statics.getAdherenceByTimeOfDay = async function(userId, startDate, endDate) {
  const logs = await this.find({
    userId,
    timestamp: {
      $gte: startDate,
      $lte: endDate
    }
  });

  // Initialize time of day stats
  const timeOfDayStats = {
    morning: { total: 0, taken: 0, adherenceRate: 0 },    // 5:00 - 11:59
    afternoon: { total: 0, taken: 0, adherenceRate: 0 },  // 12:00 - 16:59
    evening: { total: 0, taken: 0, adherenceRate: 0 },    // 17:00 - 20:59
    night: { total: 0, taken: 0, adherenceRate: 0 }       // 21:00 - 4:59
  };

  // Process logs
  logs.forEach(log => {
    const hour = parseInt(log.time.split(':')[0], 10);
    let timeOfDay;

    if (hour >= 5 && hour < 12) {
      timeOfDay = 'morning';
    } else if (hour >= 12 && hour < 17) {
      timeOfDay = 'afternoon';
    } else if (hour >= 17 && hour < 21) {
      timeOfDay = 'evening';
    } else {
      timeOfDay = 'night';
    }

    timeOfDayStats[timeOfDay].total++;
    if (log.status === 'taken') {
      timeOfDayStats[timeOfDay].taken++;
    }
  });

  // Calculate adherence rates
  Object.keys(timeOfDayStats).forEach(key => {
    const stats = timeOfDayStats[key];
    stats.adherenceRate = stats.total > 0 ? (stats.taken / stats.total) * 100 : 0;
  });

  return timeOfDayStats;
};

// Static method to get adherence by medicine
reminderLogSchema.statics.getAdherenceByMedicine = async function(userId, startDate, endDate) {
  const logs = await this.find({
    userId,
    timestamp: {
      $gte: startDate,
      $lte: endDate
    }
  }).populate('medicineId', 'name dosage');

  // Group logs by medicine
  const medicineStats = {};

  logs.forEach(log => {
    if (!log.medicineId) return;

    const medicineId = log.medicineId._id.toString();

    if (!medicineStats[medicineId]) {
      medicineStats[medicineId] = {
        medicineId,
        name: log.medicineId.name,
        dosage: log.medicineId.dosage,
        total: 0,
        taken: 0,
        skipped: 0,
        missed: 0,
        adherenceRate: 0
      };
    }

    medicineStats[medicineId].total++;

    if (log.status === 'taken') {
      medicineStats[medicineId].taken++;
    } else if (log.status === 'skipped') {
      medicineStats[medicineId].skipped++;
    } else if (log.status === 'missed') {
      medicineStats[medicineId].missed++;
    }
  });

  // Calculate adherence rates
  Object.keys(medicineStats).forEach(key => {
    const stats = medicineStats[key];
    stats.adherenceRate = stats.total > 0 ? (stats.taken / stats.total) * 100 : 0;
  });

  return Object.values(medicineStats);
};

const ReminderLog = mongoose.model('ReminderLog', reminderLogSchema);

export default ReminderLog;