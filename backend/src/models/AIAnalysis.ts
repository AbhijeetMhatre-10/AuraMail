import mongoose, { Schema, Document } from 'mongoose';

export type AICategory =
  | 'Work'
  | 'Personal'
  | 'Finance'
  | 'Updates'
  | 'Promotions'
  | 'Urgent'
  | 'Spam'
  | 'General';

export type AIPriority = 'urgent' | 'high' | 'medium' | 'low';
export type AIRiskLevel = 'none' | 'low' | 'medium' | 'high';

export interface IAIAnalysis extends Document {
  userId: mongoose.Types.ObjectId;
  emailId?: mongoose.Types.ObjectId;
  gmailMessageId: string;
  gmailThreadId?: string;
  analysisVersion: string;
  summary: string;
  category: AICategory;
  categoryConfidence?: number;
  priority: AIPriority;
  priorityScore: number; // 0 - 100
  priorityReason?: string;
  importance: 'high' | 'normal' | 'low';
  spamRisk: AIRiskLevel;
  phishingRisk: AIRiskLevel;
  spamPhishingReasons: string[];
  actionItems: string[];
  deadlines: {
    description: string;
    dueDate?: string;
  }[];
  keyEntities: string[];
  sentiment?: 'positive' | 'neutral' | 'negative' | 'urgent';
  explanation?: string;
  suggestedQuickReplies?: string[];
  generatedSubject?: string;
  analyzedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AIAnalysisSchema = new Schema<IAIAnalysis>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    emailId: { type: Schema.Types.ObjectId, ref: 'Email', index: true },
    gmailMessageId: { type: String, required: true, index: true },
    gmailThreadId: { type: String, index: true },
    analysisVersion: { type: String, default: '1.0.0' },
    summary: { type: String, required: true },
    category: {
      type: String,
      enum: ['Work', 'Personal', 'Finance', 'Updates', 'Promotions', 'Urgent', 'Spam', 'General'],
      default: 'General',
    },
    categoryConfidence: { type: Number, min: 0, max: 1 },
    priority: {
      type: String,
      enum: ['urgent', 'high', 'medium', 'low'],
      default: 'medium',
    },
    priorityScore: { type: Number, default: 50, min: 0, max: 100 },
    priorityReason: { type: String },
    importance: { type: String, enum: ['high', 'normal', 'low'], default: 'normal' },
    spamRisk: { type: String, enum: ['none', 'low', 'medium', 'high'], default: 'none' },
    phishingRisk: { type: String, enum: ['none', 'low', 'medium', 'high'], default: 'none' },
    spamPhishingReasons: [{ type: String }],
    actionItems: [{ type: String }],
    deadlines: [
      {
        description: { type: String },
        dueDate: { type: String },
      },
    ],
    keyEntities: [{ type: String }],
    sentiment: { type: String, enum: ['positive', 'neutral', 'negative', 'urgent'], default: 'neutral' },
    explanation: { type: String },
    suggestedQuickReplies: [{ type: String }],
    generatedSubject: { type: String },
    analyzedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

AIAnalysisSchema.index({ userId: 1, gmailMessageId: 1 }, { unique: true });

export const AIAnalysis = mongoose.model<IAIAnalysis>('AIAnalysis', AIAnalysisSchema);
