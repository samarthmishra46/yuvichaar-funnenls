import mongoose, { Schema, Document, Model } from 'mongoose';

// Leave types based on company policy
export const LEAVE_TYPES = {
  casual: { code: 'CL', name: 'Casual Leave', days: 10, description: 'Short-term personal needs. Short notice acceptable.', carryForward: false },
  paid: { code: 'PL', name: 'Paid Leave', days: 15, description: 'Planned absences. 5+ days needs 2 weeks notice.', carryForward: true, maxCarryForward: 18 },
  optional_holiday: { code: 'OH', name: 'Optional Holidays', days: 2, description: 'Personal preference — festivals or occasions.', carryForward: false },
  menstrual: { code: 'MHL', name: 'Menstrual Leave', days: 12, description: '1 day/month. No docs needed. Confidential.', carryForward: false },
  marriage: { code: 'ML', name: 'Marriage Leave', days: 7, description: 'One-time during employment. Advance notice reqd.', carryForward: false, oneTime: true },
  rehabilitation: { code: 'RL', name: 'Rehabilitation Leave', days: 5, description: 'Mental/physical recovery. Confidential. No LOP.', carryForward: false },
  public_holiday: { code: 'GH', name: 'Gazetted Holidays', days: 13, description: 'All Indian public holidays. See Holiday Calendar.', carryForward: false },
  compensatory: { code: 'COMP', name: 'Comp Leave', days: 0, description: '1 day added per Sunday worked/shoot attended.', carryForward: true, earned: true },
};

export type LeaveType = keyof typeof LEAVE_TYPES;

export interface ILeave extends Document {
  staffId: string;
  staffEmail: string;
  staffName: string;
  leaveType: LeaveType;
  startDate: Date;
  endDate: Date;
  days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  adminResponse?: string;
  respondedAt?: Date;
  respondedBy?: string;
  createdAt: Date;
}

// For compensatory leave requests (Sunday work)
export interface ICompRequest extends Document {
  staffId: string;
  staffEmail: string;
  staffName: string;
  workDate: Date;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  adminResponse?: string;
  respondedAt?: Date;
  respondedBy?: string;
  createdAt: Date;
}

// Staff leave balance for the fiscal year
export interface IStaffLeaveBalance extends Document {
  staffId: string;
  staffEmail: string;
  fiscalYear: string; // e.g., "2026-27"
  balances: {
    casual: { total: number; used: number; available: number };
    paid: { total: number; used: number; available: number };
    optional_holiday: { total: number; used: number; available: number };
    menstrual: { total: number; used: number; available: number };
    marriage: { total: number; used: number; available: number };
    rehabilitation: { total: number; used: number; available: number };
    public_holiday: { total: number; used: number; available: number };
    compensatory: { total: number; used: number; available: number };
  };
  updatedAt: Date;
}

const LeaveSchema = new Schema<ILeave>(
  {
    staffId: { type: String, required: true, index: true },
    staffEmail: { type: String, required: true },
    staffName: { type: String, required: true },
    leaveType: {
      type: String,
      enum: Object.keys(LEAVE_TYPES),
      required: true,
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    days: { type: Number, required: true },
    reason: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
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

const CompRequestSchema = new Schema<ICompRequest>(
  {
    staffId: { type: String, required: true, index: true },
    staffEmail: { type: String, required: true },
    staffName: { type: String, required: true },
    workDate: { type: Date, required: true },
    reason: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
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

const StaffLeaveBalanceSchema = new Schema<IStaffLeaveBalance>(
  {
    staffId: { type: String, required: true, index: true },
    staffEmail: { type: String, required: true },
    fiscalYear: { type: String, required: true },
    balances: {
      casual: { total: { type: Number, default: 10 }, used: { type: Number, default: 0 }, available: { type: Number, default: 10 } },
      paid: { total: { type: Number, default: 15 }, used: { type: Number, default: 0 }, available: { type: Number, default: 15 } },
      optional_holiday: { total: { type: Number, default: 2 }, used: { type: Number, default: 0 }, available: { type: Number, default: 2 } },
      menstrual: { total: { type: Number, default: 12 }, used: { type: Number, default: 0 }, available: { type: Number, default: 12 } },
      marriage: { total: { type: Number, default: 7 }, used: { type: Number, default: 0 }, available: { type: Number, default: 7 } },
      rehabilitation: { total: { type: Number, default: 5 }, used: { type: Number, default: 0 }, available: { type: Number, default: 5 } },
      public_holiday: { total: { type: Number, default: 13 }, used: { type: Number, default: 0 }, available: { type: Number, default: 13 } },
      compensatory: { total: { type: Number, default: 0 }, used: { type: Number, default: 0 }, available: { type: Number, default: 0 } },
    },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: false,
  }
);

// Compound index for unique balance per staff per fiscal year
StaffLeaveBalanceSchema.index({ staffId: 1, fiscalYear: 1 }, { unique: true });

const Leave: Model<ILeave> =
  mongoose.models.Leave || mongoose.model<ILeave>('Leave', LeaveSchema);

const CompRequest: Model<ICompRequest> =
  mongoose.models.CompRequest || mongoose.model<ICompRequest>('CompRequest', CompRequestSchema);

const StaffLeaveBalance: Model<IStaffLeaveBalance> =
  mongoose.models.StaffLeaveBalance || mongoose.model<IStaffLeaveBalance>('StaffLeaveBalance', StaffLeaveBalanceSchema);

export { Leave, CompRequest, StaffLeaveBalance };
export default Leave;
