const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  dosage: {
    type: String,
    required: true
  },
  frequency: {
    type: String,
    required: true
  },
  time: [String],
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: Date,
  notes: String,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

const Medicine = mongoose.model('Medicine', medicineSchema);

module.exports = Medicine; 