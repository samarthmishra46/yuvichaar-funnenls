import mongoose, { Schema, Document, Model } from 'mongoose';

/* ──────────────────────────────────────────────
   Interface
   ────────────────────────────────────────────── */

export interface IResearchEntry extends Document {
  orgId: mongoose.Types.ObjectId;
  title: string;
  type: 'pdf' | 'googledoc';
  fileUrl?: string;       // Cloudinary URL – for PDFs
  docLink?: string;       // Google Doc URL
  description?: string;
  createdAt: Date;
}

/* ──────────────────────────────────────────────
   Schema
   ────────────────────────────────────────────── */

const ResearchEntrySchema = new Schema<IResearchEntry>(
  {
    orgId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    title: { type: String, required: true },
    type: {
      type: String,
      required: true,
      enum: ['pdf', 'googledoc'],
    },
    fileUrl: { type: String },
    docLink: { type: String },
    description: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

/* ──────────────────────────────────────────────
   Export
   ────────────────────────────────────────────── */

const ResearchEntry: Model<IResearchEntry> =
  mongoose.models.ResearchEntry ||
  mongoose.model<IResearchEntry>('ResearchEntry', ResearchEntrySchema);

export default ResearchEntry;
