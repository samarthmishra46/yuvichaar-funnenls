import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IExpense extends Document {
  orgId: string;
  category: string;
  description: string;
  amount: number;
  date: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const ExpenseSchema = new Schema<IExpense>(
  {
    orgId: { type: String, required: true, index: true },
    category: { 
      type: String, 
      required: true,
      enum: ['marketing', 'tools', 'freelancer', 'ads', 'software', 'hosting', 'design', 'content', 'other'],
      default: 'other'
    },
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    date: { type: Date, required: true, default: Date.now },
    createdBy: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const Expense: Model<IExpense> =
  mongoose.models.Expense || mongoose.model<IExpense>('Expense', ExpenseSchema);

export default Expense;
