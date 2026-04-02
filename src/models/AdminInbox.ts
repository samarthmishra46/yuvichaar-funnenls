import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAdminMessage extends Document {
  type: 'leave_request' | 'task_completed' | 'client_request' | 'system';
  title: string;
  message: string;
  fromType: 'staff' | 'client' | 'system';
  fromId?: string;
  fromName: string;
  fromEmail?: string;
  orgId?: string;
  orgName?: string;
  relatedId?: string; // ID of leave, task, or client request
  metadata?: {
    leaveType?: string;
    startDate?: string;
    endDate?: string;
    taskTitle?: string;
    dayNumber?: number;
    proofOfWorkType?: string;
    proofOfWorkUrl?: string;
    requestType?: string;
  };
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
}

const AdminMessageSchema = new Schema<IAdminMessage>(
  {
    type: {
      type: String,
      enum: ['leave_request', 'task_completed', 'client_request', 'system'],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    fromType: {
      type: String,
      enum: ['staff', 'client', 'system'],
      required: true,
    },
    fromId: { type: String },
    fromName: { type: String, required: true },
    fromEmail: { type: String },
    orgId: { type: String, index: true },
    orgName: { type: String },
    relatedId: { type: String },
    metadata: {
      leaveType: { type: String },
      startDate: { type: String },
      endDate: { type: String },
      taskTitle: { type: String },
      dayNumber: { type: Number },
      proofOfWorkType: { type: String },
      proofOfWorkUrl: { type: String },
      requestType: { type: String },
    },
    isRead: { type: Boolean, default: false },
    readAt: { type: Date },
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: false,
  }
);

// Index for efficient filtering
AdminMessageSchema.index({ isRead: 1, createdAt: -1 });
AdminMessageSchema.index({ type: 1, createdAt: -1 });

const AdminMessage: Model<IAdminMessage> =
  mongoose.models.AdminMessage || mongoose.model<IAdminMessage>('AdminMessage', AdminMessageSchema);

export default AdminMessage;
