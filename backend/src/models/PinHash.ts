import mongoose, { Document, Schema } from 'mongoose';

export interface IPinHash extends Document {
  userId: mongoose.Types.ObjectId;
  hashedPin: string;
  createdAt: Date;
  updatedAt: Date;
}

const PinHashSchema = new Schema<IPinHash>({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User',
    required: true,
    unique: true
  },
  hashedPin: { 
    type: String, 
    required: true 
  }
}, {
  timestamps: true,
  versionKey: false
});

export default mongoose.model<IPinHash>('PinHash', PinHashSchema, 'pin-hashes'); 