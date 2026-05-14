import mongoose, { Schema, Document, Model } from 'mongoose';
import { ALL_CATEGORY_VALUES, ALL_SUBCATEGORY_VALUES } from '@/lib/expense-categories';

const LEGACY_CATEGORY_VALUES = [
  'marketing',
  'tools',
  'freelancer',
  'ads',
  'software',
  'hosting',
  'design',
  'content',
];

export interface ICreatorBreakdownItem {
  name: string;
  amount: number;
  notes?: string;
}

export interface IExpense extends Document {
  orgId?: string | null;
  isCompanyExpense: boolean;
  category: string;
  subcategory?: string;
  description: string;
  amount: number;
  date: Date;
  notes?: string;
  attachmentUrl?: string;
  creatorBreakdown?: ICreatorBreakdownItem[];

  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;

  paymentStatus: 'cleared' | 'due';
  clearedAt?: Date;
  clearedBy?: string;

  createdBy: string;
  createdByRole: 'admin' | 'staff';
  verifiedBy?: string;
  verifiedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const CreatorBreakdownSchema = new Schema<ICreatorBreakdownItem>(
  {
    name: { type: String, required: true },
    amount: { type: Number, required: true },
    notes: { type: String },
  },
  { _id: false }
);

const ExpenseSchema = new Schema<IExpense>(
  {
    orgId: { type: String, default: null, index: true },
    isCompanyExpense: { type: Boolean, default: false, index: true },
    category: {
      type: String,
      required: true,
      enum: [...ALL_CATEGORY_VALUES, ...LEGACY_CATEGORY_VALUES],
      default: 'other',
    },
    subcategory: {
      type: String,
      enum: [...ALL_SUBCATEGORY_VALUES, ''],
    },
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    date: { type: Date, required: true, default: Date.now },
    notes: { type: String },
    attachmentUrl: { type: String },
    creatorBreakdown: { type: [CreatorBreakdownSchema], default: undefined },

    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
    rejectionReason: { type: String },

    paymentStatus: {
      type: String,
      enum: ['cleared', 'due'],
      default: 'cleared',
      index: true,
    },
    clearedAt: { type: Date },
    clearedBy: { type: String },

    createdBy: { type: String, required: true },
    createdByRole: { type: String, enum: ['admin', 'staff'], required: true },
    verifiedBy: { type: String },
    verifiedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

ExpenseSchema.path('orgId').validate(function (this: IExpense, value: string | null) {
  if (!this.isCompanyExpense && !value) return false;
  return true;
}, 'orgId is required for non-company expenses');

const Expense: Model<IExpense> =
  mongoose.models.Expense || mongoose.model<IExpense>('Expense', ExpenseSchema);

export default Expense;
