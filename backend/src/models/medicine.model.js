import mongoose from 'mongoose';

const medicineSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  dosage: {
    type: String,
    required: true,
    trim: true
  },
  frequency: {
    type: String,
    required: true,
    enum: ['daily', 'weekly', 'custom'],
    default: 'daily'
  },
  times: [{
    type: String,
    trim: true
  }],
  notes: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // Inventory management fields
  inventoryCount: {
    type: Number,
    min: 0,
    default: 0
  },
  dosesPerIntake: {
    type: Number,
    min: 0.5,
    default: 1
  },
  lowInventoryThreshold: {
    type: Number,
    min: 1,
    default: 5
  },
  refillReminder: {
    type: Boolean,
    default: true
  },
  refillAmount: {
    type: Number,
    min: 0,
    default: 30
  },
  lastRefillDate: {
    type: Date,
    default: null
  },
  expirationDate: {
    type: Date,
    default: null
  },
  pharmacy: {
    name: {
      type: String,
      trim: true,
      default: ''
    },
    phone: {
      type: String,
      trim: true,
      default: ''
    },
    prescriptionNumber: {
      type: String,
      trim: true,
      default: ''
    }
  }
}, {
  timestamps: true
});

// Index for faster queries
medicineSchema.index({ userId: 1 });
medicineSchema.index({ inventoryCount: 1, lowInventoryThreshold: 1 });

// Virtual for remaining days of medication based on inventory and dosage
medicineSchema.virtual('daysRemaining').get(function() {
  if (!this.inventoryCount || !this.dosesPerIntake || !this.times || this.times.length === 0) {
    return 0;
  }

  // Calculate daily consumption based on frequency and times
  let dailyConsumption = 0;

  if (this.frequency === 'daily') {
    dailyConsumption = this.times.length * this.dosesPerIntake;
  } else if (this.frequency === 'weekly') {
    dailyConsumption = (this.times.length * this.dosesPerIntake) / 7;
  } else if (this.frequency === 'custom') {
    // For custom frequency, we'll assume the times array contains all scheduled times for a week
    dailyConsumption = (this.times.length * this.dosesPerIntake) / 7;
  }

  if (dailyConsumption === 0) return 0;

  return Math.floor(this.inventoryCount / dailyConsumption);
});

// Method to check if inventory is low
medicineSchema.methods.isLowInventory = function() {
  return this.inventoryCount <= this.lowInventoryThreshold;
};

// Method to update inventory after taking medication
medicineSchema.methods.updateInventoryAfterDose = async function(status) {
  if (status === 'taken') {
    this.inventoryCount = Math.max(0, this.inventoryCount - this.dosesPerIntake);
    await this.save();
  }
  return this;
};

// Method to refill inventory
medicineSchema.methods.refill = async function(amount = null) {
  const refillAmount = amount || this.refillAmount;
  this.inventoryCount += refillAmount;
  this.lastRefillDate = new Date();
  await this.save();
  return this;
};

// Static method to find medicines with low inventory
medicineSchema.statics.findLowInventory = function(userId) {
  return this.find({
    userId,
    isActive: true,
    refillReminder: true,
    $expr: { $lte: ['$inventoryCount', '$lowInventoryThreshold'] }
  });
};

const Medicine = mongoose.model('Medicine', medicineSchema);

export default Medicine;