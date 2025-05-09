import mongoose, { Document, Schema } from 'mongoose';

export interface IMedicine extends Document {
  name: string;
  dosage: string;
  frequency: string;
  userId: mongoose.Types.ObjectId;
  instructions?: string;
  sideEffects?: string[];
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MedicineSchema = new Schema<IMedicine>({
  name: { 
    type: String, 
    required: true 
  },
  dosage: { 
    type: String, 
    required: true 
  },
  frequency: { 
    type: String, 
    required: true 
  },
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  instructions: { 
    type: String 
  },
  sideEffects: [{ 
    type: String 
  }],
  startDate: { 
    type: Date 
  },
  endDate: { 
    type: Date 
  }
}, {
  timestamps: true,
  versionKey: false
});

export default mongoose.model<IMedicine>('Medicine', MedicineSchema); 