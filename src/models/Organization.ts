import mongoose, { Schema, Document, Model } from 'mongoose';

/* ──────────────────────────────────────────────
   Sub-document interfaces
   ────────────────────────────────────────────── */

export interface IPaymentRecord {
  amount: number;
  date: Date;
  note?: string;
  razorpayPaymentId?: string;
}

export interface ICustomSection {
  id: string;
  title: string;
  contentType: 'richtext' | 'file' | 'link' | 'video';
  content?: string;
  fileUrl?: string;
  bunnyVideoId?: string;
  bunnyStreamUrl?: string;
  createdAt: Date;
}

/* ──────────────────────────────────────────────
   Main document interface
   ────────────────────────────────────────────── */

export interface IOrganization extends Document {
  name: string;
  email: string;
  password: string;
  phone?: string;
  website?: string;
  address?: string;
  logo?: string;
  industry?: string;
  accountManager?: string;
  status: 'onboarding' | 'active' | 'paused' | 'churned';
  landingPageUrl?: string;
  landingPageNotes?: string;
  payment: {
    totalAmount: number;
    minimumPayment: number;
    payments: IPaymentRecord[];
  };
  customSections: ICustomSection[];
  onboarding: {
    token?: string;
    mouUrl?: string;
    sowUrl?: string;
    signedAt?: Date;
    signatureUrl?: string;
    minimumPaymentPaid: boolean;
    passwordSetup: boolean;
  };
  createdAt: Date;
}

/* ──────────────────────────────────────────────
   Sub-schemas
   ────────────────────────────────────────────── */

const PaymentRecordSchema = new Schema<IPaymentRecord>(
  {
    amount: { type: Number, required: true },
    date: { type: Date, required: true, default: Date.now },
    note: { type: String },
    razorpayPaymentId: { type: String },
  },
  { _id: false }
);

const CustomSectionSchema = new Schema<ICustomSection>(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    contentType: {
      type: String,
      required: true,
      enum: ['richtext', 'file', 'link', 'video'],
    },
    content: { type: String },
    fileUrl: { type: String },
    bunnyVideoId: { type: String },
    bunnyStreamUrl: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

/* ──────────────────────────────────────────────
   Main schema
   ────────────────────────────────────────────── */

const OrganizationSchema = new Schema<IOrganization>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String },
    website: { type: String },
    address: { type: String },
    logo: { type: String },
    industry: { type: String },
    accountManager: { type: String },
    status: {
      type: String,
      enum: ['onboarding', 'active', 'paused', 'churned'],
      default: 'onboarding',
    },
    landingPageUrl: { type: String },
    landingPageNotes: { type: String },
    payment: {
      totalAmount: { type: Number, default: 0 },
      minimumPayment: { type: Number, default: 0 },
      payments: { type: [PaymentRecordSchema], default: [] },
    },
    customSections: { type: [CustomSectionSchema], default: [] },
    onboarding: {
      token: { type: String },
      mouUrl: { type: String },
      sowUrl: { type: String },
      signedAt: { type: Date },
      signatureUrl: { type: String },
      minimumPaymentPaid: { type: Boolean, default: false },
      passwordSetup: { type: Boolean, default: false },
    },
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: false,          // we manage createdAt ourselves
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

/* ──────────────────────────────────────────────
   Export — guard against model re-compilation
   ────────────────────────────────────────────── */

const Organization: Model<IOrganization> =
  mongoose.models.Organization ||
  mongoose.model<IOrganization>('Organization', OrganizationSchema);

export default Organization;
