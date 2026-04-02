import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IClientTask extends Document {
  orgId: string;
  orgName: string;
  title: string;
  description: string;
  taskType: 'credentials' | 'document' | 'information' | 'access' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed';
  createdBy: string;
  createdByEmail: string;
  createdByRole: 'staff' | 'admin';
  clientResponse?: string;
  clientRespondedAt?: Date;
  completedAt?: Date;
  completedBy?: string;
  createdAt: Date;
}

const ClientTaskSchema = new Schema<IClientTask>(
  {
    orgId: { type: String, required: true, index: true },
    orgName: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    taskType: {
      type: String,
      enum: ['credentials', 'document', 'information', 'access', 'other'],
      default: 'other',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed'],
      default: 'pending',
    },
    createdBy: { type: String, required: true },
    createdByEmail: { type: String, required: true },
    createdByRole: {
      type: String,
      enum: ['staff', 'admin'],
      required: true,
    },
    clientResponse: { type: String },
    clientRespondedAt: { type: Date },
    completedAt: { type: Date },
    completedBy: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: false,
  }
);

const ClientTask: Model<IClientTask> =
  mongoose.models.ClientTask || mongoose.model<IClientTask>('ClientTask', ClientTaskSchema);

export default ClientTask;
