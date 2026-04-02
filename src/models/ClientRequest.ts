import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IClientRequest extends Document {
  orgId: string;
  orgName: string;
  requestType: 'access' | 'information' | 'document' | 'other';
  title: string;
  description: string;
  attachmentUrl?: string;
  status: 'pending' | 'in_progress' | 'completed';
  adminResponse?: string;
  respondedAt?: Date;
  respondedBy?: string;
  createdAt: Date;
}

const ClientRequestSchema = new Schema<IClientRequest>(
  {
    orgId: { type: String, required: true, index: true },
    orgName: { type: String, required: true },
    requestType: {
      type: String,
      enum: ['access', 'information', 'document', 'other'],
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    attachmentUrl: { type: String },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed'],
      default: 'pending',
    },
    adminResponse: { type: String },
    respondedAt: { type: Date },
    respondedBy: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: false,
  }
);

const ClientRequest: Model<IClientRequest> =
  mongoose.models.ClientRequest || mongoose.model<IClientRequest>('ClientRequest', ClientRequestSchema);

export default ClientRequest;
