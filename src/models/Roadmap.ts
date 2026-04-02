import mongoose, { Schema, Document, Model } from 'mongoose';

// Phase definitions for the 60-day roadmap
export const ROADMAP_PHASES = [
  { id: 1, name: 'Strategy & Pre-Production', startDay: 1, endDay: 9, color: '#8b5cf6' },
  { id: 2, name: 'Production', startDay: 10, endDay: 14, color: '#f59e0b' },
  { id: 3, name: 'Post-Production + Approvals', startDay: 15, endDay: 21, color: '#10b981' },
  { id: 4, name: 'Automation Completion', startDay: 22, endDay: 28, color: '#3b82f6' },
  { id: 5, name: 'Optimisation & Scale', startDay: 29, endDay: 60, color: '#e91e8c' },
];

// Day titles that are shown to clients (parent tasks)
export const ROADMAP_DAY_TITLES: Record<number, { title: string; milestone?: boolean }> = {
  1: { title: 'Kickoff & Setup' },
  3: { title: 'Strategy Development' },
  5: { title: 'Strategy Review' },
  6: { title: 'Strategy Approval' },
  7: { title: 'Shoot Blueprint' },
  8: { title: 'Scripts & Storyboards Review' },
  9: { title: 'Pre-Production Complete' },
  10: { title: 'Ad Shoot Day 1' },
  11: { title: 'Ad Shoot Day 2' },
  12: { title: 'Ad Shoot Day 3' },
  13: { title: 'Social Media Content Shoot' },
  14: { title: 'Editing Begins' },
  15: { title: 'First Cuts Ready' },
  17: { title: 'Revisions' },
  18: { title: 'Revised Cuts Review' },
  19: { title: 'All Assets Final' },
  20: { title: 'Full Funnel QA' },
  21: { title: 'Launch Day', milestone: true },
  22: { title: 'Automation Sequences' },
  26: { title: 'VSL Integration' },
  28: { title: 'Landing Page Final' },
  29: { title: 'Day 3 Data Report' },
  35: { title: 'Week 1 Report', milestone: true },
  42: { title: 'Week 2 Report', milestone: true },
  45: { title: 'Mid Marathon Review', milestone: true },
  48: { title: 'Week 3 Report' },
  50: { title: 'Final Push', milestone: true },
  54: { title: 'Week 4 Report' },
  58: { title: 'Results & Handover Prep' },
  59: { title: 'Results Shared' },
  60: { title: 'Marathon Complete', milestone: true },
};

// Default subtasks for each day (these are assigned to staff)
export const DEFAULT_SUBTASKS: Record<number, string[]> = {
  1: [
    'Kickoff call',
    'Brand onboarding form',
    'Platform access collection',
    'WATI setup',
    'Email platform setup',
    'ManyChat setup',
    'Meta Ads Manager setup',
  ],
  3: ['Strategy document'],
  5: [
    'Strategy document shared with client',
    'Scripting & storyboarding',
    'Casting',
    'Location scouting',
  ],
  6: ['Strategy document approval'],
  7: ['The Shoot Blueprint'],
  8: ['Scripts & storyboards shared with client'],
  9: [
    'Scripts & storyboards approval',
    'Call sheets issued',
    'Booking confirmations',
    'The Shoot Blueprint final',
    'Landing page',
    'Checkout setup',
  ],
  10: ['Ad shoot Day 1'],
  11: ['Ad shoot Day 2'],
  12: ['Ad shoot Day 3'],
  13: ['Social media content shoot', 'Editing brief issued to editors'],
  14: ['Video ads editing', 'Social media videos editing', 'Image assets'],
  15: [
    '15 video ads first cut',
    '12 social media videos first cut',
    'Video ads shared with client',
  ],
  17: ['Video ad revisions'],
  18: ['Video ads revised cut shared with client'],
  19: [
    '15 video ads final',
    '12 social media videos final',
    'Image assets final',
    'Landing page final',
    'Checkout live',
    'Social media profile live',
    'WATI setup complete',
    'Email automation setup complete',
    'ManyChat automations complete',
  ],
  20: ['Full funnel QA', 'All automations tested', 'Campaigns ready to launch', 'Pre-launch brief shared'],
  21: [
    '15 video ads live on Meta',
    'Landing page live',
    'Checkout live',
    'Social media profile live',
    'All automation sequences live',
    'Campaigns live',
  ],
  22: [
    'WATI cart abandonment sequences',
    'WATI repeat purchase sequences',
    'Email cart abandonment sequences',
    'Email post-purchase sequences',
    'Video Sales Letter',
    'AI calling testing',
  ],
  26: ['VSL integrated into landing page', 'Social proof assets', 'AI calling tested'],
  28: ['Landing page final version with VSL + social proof'],
  29: ['Day 3 data report shared'],
  35: ['Week 1 performance report', 'Creative refresh batch 1'],
  42: ['Week 2 performance report', 'Creative refresh batch 2'],
  45: ['Mid-marathon performance report', 'Mid-marathon call'],
  48: ['Week 3 performance report'],
  50: ['Maximum budget on proven winners'],
  54: ['Week 4 performance report'],
  58: ['60-day results report', '60-day wrap deck', 'Technical handover document'],
  59: ['60-day results report shared', '60-day wrap deck shared'],
  60: ['Wrap call', 'Continuation plan presented', 'All assets handed over', 'Technical handover document shared', 'Client testimonial requested'],
};

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
  status: 'pending' | 'in_progress' | 'completed' | 'waiting_on_client';
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
      enum: ['pending', 'in_progress', 'completed', 'waiting_on_client'],
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
