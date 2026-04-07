import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPhase {
  id: number;
  name: string;
  startDay: number;
  endDay: number;
  color: string;
}

export interface IDayTitle {
  title: string;
  milestone?: boolean;
}

export interface IDayConfig {
  dayNumber: number;
  title: string;
  milestone?: boolean;
  subtasks: string[];
}

export interface IRoadmapTemplate extends Document {
  name: string;
  description?: string;
  totalDays: number;
  phases: IPhase[];
  days: IDayConfig[];
  isDefault?: boolean;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PhaseSchema = new Schema<IPhase>(
  {
    id: { type: Number, required: true },
    name: { type: String, required: true },
    startDay: { type: Number, required: true },
    endDay: { type: Number, required: true },
    color: { type: String, required: true },
  },
  { _id: false }
);

const DayConfigSchema = new Schema<IDayConfig>(
  {
    dayNumber: { type: Number, required: true },
    title: { type: String, required: true },
    milestone: { type: Boolean, default: false },
    subtasks: [{ type: String }],
  },
  { _id: false }
);

const RoadmapTemplateSchema = new Schema<IRoadmapTemplate>(
  {
    name: { type: String, required: true },
    description: { type: String },
    totalDays: { type: Number, required: true },
    phases: [PhaseSchema],
    days: [DayConfigSchema],
    isDefault: { type: Boolean, default: false },
    createdBy: { type: String },
  },
  {
    timestamps: true,
  }
);

const RoadmapTemplate: Model<IRoadmapTemplate> =
  mongoose.models.RoadmapTemplate || mongoose.model<IRoadmapTemplate>('RoadmapTemplate', RoadmapTemplateSchema);

export default RoadmapTemplate;
