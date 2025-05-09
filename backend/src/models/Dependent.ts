import mongoose, { Document, Schema } from 'mongoose';

export interface IDependent extends Document {
  firstName: string;
  lastName: string;
  relationship: string;
  dateOfBirth?: Date;
  userId: mongoose.Types.ObjectId;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DependentSchema = new Schema<IDependent>({
  firstName: { 
    type: String, 
    required: true 
  },
  lastName: { 
    type: String, 
    required: true 
  },
  relationship: { 
    type: String, 
    required: true 
  },
  dateOfBirth: { 
    type: Date 
  },
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  notes: { 
    type: String 
  }
}, {
  timestamps: true,
  versionKey: false
});

export default mongoose.model<IDependent>('Dependent', DependentSchema); 