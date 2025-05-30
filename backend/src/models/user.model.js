import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email address']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  role: {
    type: String,
    enum: ['user', 'caregiver', 'admin'],
    default: 'user'
  },
  resetPasswordToken: {
    type: String,
    default: null
  },
  resetPasswordExpires: {
    type: Date,
    default: null
  },
  // Caregiver functionality - people who can monitor this user
  caregivers: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: String,
    email: String,
    notifyOnMissed: {
      type: Boolean,
      default: true
    },
    notifyOnAdherence: {
      type: Boolean,
      default: false
    },
    accessLevel: {
      type: String,
      enum: ['view', 'manage'],
      default: 'view'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Users this person is caregiving for
  caregivingFor: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: String,
    accessLevel: {
      type: String,
      enum: ['view', 'manage'],
      default: 'view'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // User preferences
  preferences: {
    emailNotifications: {
      type: Boolean,
      default: true
    },
    pushNotifications: {
      type: Boolean,
      default: true
    },
    reminderAdvanceMinutes: {
      type: Number,
      default: 15,
      min: 0,
      max: 60
    },
    defaultView: {
      type: String,
      enum: ['daily', 'weekly', 'calendar'],
      default: 'daily'
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving to database
userSchema.pre('save', async function(next) {
  // Only hash the password if it's modified or new
  if (!this.isModified('password')) return next();

  try {
    // Generate salt with 10 rounds
    const salt = await bcrypt.genSalt(10);
    // Hash the password with the salt
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;