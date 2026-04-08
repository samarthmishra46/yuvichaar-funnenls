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

export interface IDeliverable {
  name: string;
  description: string;
  quantity: string;
  enabled: boolean;
}

export interface ITimelineItem {
  week: string;
  phase: string;
  description: string;
}

export interface IStat {
  value: string;
  label: string;
}

export interface IDealPage {
  // Proposal title (e.g., "60 Day Growth Marathon")
  proposalTitle?: string;
  goal?: string;
  target?: string;
  startDate?: string;
  adsCount?: number;
  socialVideosCount?: number;
  landingPagesCount?: number;
  fixedFee?: number;
  advanceAmount?: number;
  advanceWithGst?: number;
  balanceAmount?: number;
  balanceWithGst?: number;
  hasPerformanceFee?: boolean;
  perfBonus1Trigger?: string;
  perfBonus1Amount?: string;
  perfBonus2Trigger?: string;
  perfBonus2Amount?: string;
  customDeliverable?: string;
  customDeliverableDesc?: string;
  portfolioUrl?: string;
  whatsappNumber?: string;
  razorpayLink?: string;
  // Signature fields
  signatureName?: string;
  signedAt?: Date;
  advancePaid?: boolean;
  advancePaidAt?: Date;
  // Success screen items (what client gets after payment)
  successItems?: string[];
  nextStepText?: string;
  // Deliverables (editable list)
  deliverables?: IDeliverable[];
  // Timeline items (editable list)
  timeline?: ITimelineItem[];
  // Stats for "Why Yuvichaar Funnels" section
  stats?: IStat[];
}

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
  dealPage?: IDealPage;
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
    dealPage: {
      proposalTitle: { type: String, default: '60 Day Growth Marathon' },
      goal: { type: String, default: 'Build an end-to-end D2C marketing funnel' },
      target: { type: String, default: '1,000 paying customers' },
      startDate: { type: String },
      adsCount: { type: Number, default: 15 },
      socialVideosCount: { type: Number, default: 12 },
      landingPagesCount: { type: Number, default: 1 },
      fixedFee: { type: Number, default: 449000 },
      advanceAmount: { type: Number, default: 224500 },
      advanceWithGst: { type: Number, default: 264910 },
      balanceAmount: { type: Number, default: 224500 },
      balanceWithGst: { type: Number, default: 264910 },
      hasPerformanceFee: { type: Boolean, default: true },
      perfBonus1Trigger: { type: String, default: '₹25,00,000' },
      perfBonus1Amount: { type: String, default: '₹1,00,000' },
      perfBonus2Trigger: { type: String, default: '₹50,00,000' },
      perfBonus2Amount: { type: String, default: '₹1,00,000' },
      customDeliverable: { type: String },
      customDeliverableDesc: { type: String },
      portfolioUrl: { type: String },
      whatsappNumber: { type: String, default: '919999900001' },
      razorpayLink: { type: String },
      signatureName: { type: String },
      signedAt: { type: Date },
      advancePaid: { type: Boolean, default: false },
      advancePaidAt: { type: Date },
      successItems: { type: [String], default: [
        'Client portal is live and ready',
        'Signed MoU + receipt sent to your email',
        'WhatsApp group created with your team',
        'Kickoff call link sent on WhatsApp',
        'Brand question form sent on WhatsApp',
        "Yuvraj's personal welcome video sent"
      ]},
      nextStepText: { type: String, default: 'Check your WhatsApp — Yuvraj sent a personal welcome message and your kickoff call link is there.' },
      deliverables: { type: [{
        name: { type: String, required: true },
        description: { type: String, required: true },
        quantity: { type: String, required: true },
        enabled: { type: Boolean, default: true }
      }], default: [
        { name: 'Performance video ads', description: 'Scripted, shot on Netflix-approved cameras, edited · UGC + founder + comparison formats · 9:16 Meta-ready', quantity: '15 ads', enabled: true },
        { name: 'Social media content + profile', description: 'Instagram Reels · bio rewrite · highlights · blue tick · curated feed ready to launch', quantity: '12 videos', enabled: true },
        { name: 'High-converting landing page(s)', description: 'VSL · hero · social proof · objection handling · urgency · dark psychology · mobile-first', quantity: '1 page', enabled: true },
        { name: 'Checkout experience', description: 'Single-click checkout · order bumps · copy optimisation · payment gateway', quantity: 'Full setup', enabled: true },
        { name: 'WATI WhatsApp automations', description: 'Cart abandonment video + text sequences · repeat purchase · cross-sell + upsell video + text · 2 months subscription covered', quantity: 'Full suite', enabled: true },
        { name: 'Email automations', description: 'Cart abandonment sequences · post-purchase flows · retention nudges', quantity: 'Full suite', enabled: true },
        { name: 'ManyChat Instagram automations', description: 'Comment triggers · DM flows · lead capture · WhatsApp opt-in', quantity: 'Full setup', enabled: true },
        { name: 'AI calling integration', description: "Automated reminder calls for high-intent visitors who didn't convert", quantity: 'Integrated', enabled: true },
        { name: 'Meta Ads setup + management', description: 'Campaign structure · audience targeting · creative testing · daily optimisation · 60 days', quantity: '60 days', enabled: true },
        { name: 'Weekly strategy calls', description: 'Screen-share · performance review · next week plan · creative feedback', quantity: '8 calls', enabled: true }
      ]},
      timeline: { type: [{
        week: { type: String, required: true },
        phase: { type: String, required: true },
        description: { type: String, required: true }
      }], default: [
        { week: 'Week 1', phase: 'Strategy', description: 'Kickoff · brand deep-dive · funnel architecture · creative angles · audience framework' },
        { week: 'Wk 2–3', phase: 'Creative production', description: 'Scripts · storyboards · shoot days · editing · social media content' },
        { week: 'Wk 3–4', phase: 'Funnel build', description: 'Landing pages · checkout · profile optimised · all automations built and tested' },
        { week: 'Wk 4–5', phase: 'Approvals + QA', description: 'Ads reviewed · feedback incorporated · full funnel tested end to end' },
        { week: 'Day 21', phase: '🚀 Campaigns go live', description: 'Ads live · automations active · landing page live · marathon officially running' },
        { week: 'Wk 5–8', phase: 'Optimise + scale', description: 'Weekly reviews · scale winners · creative refresh · final push Days 50–60' },
        { week: 'Day 60', phase: 'Wrap + handover', description: '60-day results report · wrap call · all assets and logins handed over' }
      ]},
      stats: { type: [{
        value: { type: String, required: true },
        label: { type: String, required: true }
      }], default: [
        { value: '75+', label: 'D2C brands trust us with their growth' },
        { value: '6×', label: 'Peak ROAS achieved for clients' },
        { value: '27%', label: 'Average landing page conversion rate' },
        { value: '60', label: 'Days fixed. Full funnel built and live.' }
      ]},
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
