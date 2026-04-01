import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IStaff extends Document {
  email: string;
  name: string;
  password: string;
  role?: string;
  createdAt: Date;
}

const StaffSchema = new Schema<IStaff>(
  {
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: false,
  }
);

const Staff: Model<IStaff> =
  mongoose.models.Staff || mongoose.model<IStaff>('Staff', StaffSchema);

export default Staff;
