import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProofOfWork {
  type: 'text' | 'image' | 'file';
  content?: string;
  fileUrl?: string;
  submittedAt: Date;
}

export interface ITask extends Document {
  roadmapId: string;
  orgId: string;
  dayNumber: number;
  title: string;
  description?: string;
  assignedTo?: string;
  status: 'pending' | 'in_progress' | 'completed';
  proofOfWork?: IProofOfWork;
  completedAt?: Date;
  createdAt: Date;
}

export interface IRoadmap extends Document {
  orgId: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  totalDays: number;
  createdAt: Date;
}

const ProofOfWorkSchema = new Schema<IProofOfWork>(
  {
    type: { type: String, enum: ['text', 'image', 'file'], required: true },
    content: { type: String },
    fileUrl: { type: String },
    submittedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const TaskSchema = new Schema<ITask>(
  {
    roadmapId: { type: String, required: true, index: true },
    orgId: { type: String, required: true, index: true },
    dayNumber: { type: Number, required: true },
    title: { type: String, required: true },
    description: { type: String },
    assignedTo: { type: String },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed'],
      default: 'pending',
    },
    proofOfWork: { type: ProofOfWorkSchema },
    completedAt: { type: Date },
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: false,
  }
);

const RoadmapSchema = new Schema<IRoadmap>(
  {
    orgId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    description: { type: String },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    totalDays: { type: Number, required: true, default: 60 },
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: false,
  }
);

const Task: Model<ITask> =
  mongoose.models.Task || mongoose.model<ITask>('Task', TaskSchema);

const Roadmap: Model<IRoadmap> =
  mongoose.models.Roadmap || mongoose.model<IRoadmap>('Roadmap', RoadmapSchema);

export { Task, Roadmap };
