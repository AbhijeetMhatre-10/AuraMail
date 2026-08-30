import mongoose, { Schema, Document } from 'mongoose';

export interface IEmailThread extends Document {
  userId: mongoose.Types.ObjectId;
  connectedAccountId: mongoose.Types.ObjectId;
  gmailThreadId: string;
  subject: string;
  snippet: string;
  messageCount: number;
  lastMessageDate: Date;
  isRead: boolean;
  isStarred: boolean;
  isArchived: boolean;
  isTrash: boolean;
  labels: string[];
  participants: {
    name: string;
    email: string;
  }[];
  latestAIAnalysis?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const EmailThreadSchema = new Schema<IEmailThread>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    connectedAccountId: { type: Schema.Types.ObjectId, ref: 'ConnectedAccount', required: true, index: true },
    gmailThreadId: { type: String, required: true, index: true },
    subject: { type: String, default: '(No Subject)' },
    snippet: { type: String, default: '' },
    messageCount: { type: Number, default: 1 },
    lastMessageDate: { type: Date, required: true, index: true },
    isRead: { type: Boolean, default: false, index: true },
    isStarred: { type: Boolean, default: false, index: true },
    isArchived: { type: Boolean, default: false, index: true },
    isTrash: { type: Boolean, default: false, index: true },
    labels: [{ type: String }],
    participants: [
      {
        name: { type: String, default: '' },
        email: { type: String, required: true, lowercase: true, trim: true },
      },
    ],
    latestAIAnalysis: { type: Schema.Types.ObjectId, ref: 'AIAnalysis' },
  },
  {
    timestamps: true,
  }
);

EmailThreadSchema.index({ userId: 1, gmailThreadId: 1 }, { unique: true });
EmailThreadSchema.index({ userId: 1, lastMessageDate: -1 });

export const EmailThread = mongoose.model<IEmailThread>('EmailThread', EmailThreadSchema);
