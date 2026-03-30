import mongoose, { Schema, Document, Model } from 'mongoose';

/* ──────────────────────────────────────────────
   Interface
   ────────────────────────────────────────────── */

export interface IAdVideo extends Document {
  orgId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  platform: string;       // e.g. Meta, YouTube, TikTok, General
  status: 'draft' | 'under-review' | 'approved' | 'live';
  bunnyVideoId: string;
  bunnyStreamUrl: string;
  thumbnailUrl?: string;
  createdAt: Date;
}

/* ──────────────────────────────────────────────
   Schema
   ────────────────────────────────────────────── */

const AdVideoSchema = new Schema<IAdVideo>(
  {
    orgId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    title: { type: String, required: true },
    description: { type: String },
    platform: { type: String, default: 'General' },
    status: {
      type: String,
      enum: ['draft', 'under-review', 'approved', 'live'],
      default: 'draft',
    },
    bunnyVideoId: { type: String, required: true },
    bunnyStreamUrl: { type: String, required: true },
    thumbnailUrl: { type: String },
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

const AdVideo: Model<IAdVideo> =
  mongoose.models.AdVideo ||
  mongoose.model<IAdVideo>('AdVideo', AdVideoSchema);

export default AdVideo;
