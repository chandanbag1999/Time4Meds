import mongoose, { Document, Schema } from 'mongoose';

export interface IDocument extends Document {
  name: string;
  type: string;
  fileName: string;
  fileUrl: string;
  userId: mongoose.Types.ObjectId;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DocumentSchema = new Schema<IDocument>({
  name: { 
    type: String, 
    required: true 
  },
  type: { 
    type: String, 
    required: true 
  },
  fileName: { 
    type: String, 
    required: true 
  },
  fileUrl: { 
    type: String, 
    required: true 
  },
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  description: { 
    type: String 
  }
}, {
  timestamps: true,
  versionKey: false
});

export default mongoose.model<IDocument>('Document', DocumentSchema); 