import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICompetitionAnalysis extends Document {
  orgId: mongoose.Types.ObjectId;
  status: 'processing' | 'completed' | 'failed';
  pdfUrl?: string;
  researchEntryId?: string;
  error?: string;
  createdBy?: string;
  createdAt: Date;
  completedAt?: Date;
}

const CompetitionAnalysisSchema = new Schema<ICompetitionAnalysis>(
  {
    orgId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    status: { type: String, enum: ['processing', 'completed', 'failed'], default: 'processing' },
    pdfUrl: { type: String },
    researchEntryId: { type: String },
    error: { type: String },
    createdBy: { type: String },
    createdAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
  },
  { timestamps: false }
);

const CompetitionAnalysis: Model<ICompetitionAnalysis> =
  mongoose.models.CompetitionAnalysis ||
  mongoose.model<ICompetitionAnalysis>('CompetitionAnalysis', CompetitionAnalysisSchema);

export default CompetitionAnalysis;
