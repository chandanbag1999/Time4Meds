import mongoose, { Document, Schema } from 'mongoose';

export interface IReminder extends Document {
  medicineId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  time: string;
  days: string[];
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ReminderSchema = new Schema<IReminder>({
  medicineId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Medicine',
    required: true 
  },
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  time: { 
    type: String, 
    required: true 
  },
  days: [{ 
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    required: true 
  }],
  active: { 
    type: Boolean, 
    default: true 
  }
}, {
  timestamps: true,
  versionKey: false
});

export default mongoose.model<IReminder>('Reminder', ReminderSchema); 