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
  }
}, {
  timestamps: true
});

// Index for faster queries
medicineSchema.index({ userId: 1 });

const Medicine = mongoose.model('Medicine', medicineSchema);

export default Medicine; 