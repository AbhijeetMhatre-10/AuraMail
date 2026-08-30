import mongoose, { Schema, Document } from 'mongoose';

export interface IDailySummary extends Document {
  userId: mongoose.Types.ObjectId;
  connectedAccountId?: mongoose.Types.ObjectId;
  dateString: string; // YYYY-MM-DD
  summary: string;
  urgentCount: number;
  actionItems: string[];
  keyTopics: string[];
  emailCount: number;
  generatedAt: Date;
}

const DailySummarySchema = new Schema<IDailySummary>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    connectedAccountId: { type: Schema.Types.ObjectId, ref: 'ConnectedAccount' },
    dateString: { type: String, required: true, index: true },
    summary: { type: String, required: true },
    urgentCount: { type: Number, default: 0 },
    actionItems: [{ type: String }],
    keyTopics: [{ type: String }],
    emailCount: { type: Number, default: 0 },
    generatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

DailySummarySchema.index({ userId: 1, dateString: 1 }, { unique: true });

export const DailySummary = mongoose.model<IDailySummary>('DailySummary', DailySummarySchema);
