import mongoose, { Schema, Document } from 'mongoose';
import { ParsedEmailAddress } from '../utils/emailParser.js';

export interface IEmail extends Document {
  userId: mongoose.Types.ObjectId;
  connectedAccountId: mongoose.Types.ObjectId;
  gmailMessageId: string;
  gmailThreadId: string;
  from: ParsedEmailAddress;
  to: ParsedEmailAddress[];
  cc: ParsedEmailAddress[];
  bcc: ParsedEmailAddress[];
  subject: string;
  snippet: string;
  bodyText: string;
  bodyHtml: string;
  labels: string[];
  isRead: boolean;
  isStarred: boolean;
  isArchived: boolean;
  isDraft: boolean;
  isSent: boolean;
  isTrash: boolean;
  hasAttachments: boolean;
  messageIdHeader?: string;
  inReplyTo?: string;
  references?: string;
  receivedAt: Date;
  internalDate: number;
  aiAnalysis?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const EmailAddressSubSchema = new Schema(
  {
    name: { type: String, default: '' },
    email: { type: String, required: true, lowercase: true, trim: true },
    raw: { type: String, default: '' },
  },
  { _id: false }
);

const EmailSchema = new Schema<IEmail>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    connectedAccountId: { type: Schema.Types.ObjectId, ref: 'ConnectedAccount', required: true, index: true },
    gmailMessageId: { type: String, required: true, index: true },
    gmailThreadId: { type: String, required: true, index: true },
    from: { type: EmailAddressSubSchema, required: true },
    to: [EmailAddressSubSchema],
    cc: [EmailAddressSubSchema],
    bcc: [EmailAddressSubSchema],
    subject: { type: String, default: '(No Subject)' },
    snippet: { type: String, default: '' },
    bodyText: { type: String, default: '' },
    bodyHtml: { type: String, default: '' },
    labels: [{ type: String }],
    isRead: { type: Boolean, default: false, index: true },
    isStarred: { type: Boolean, default: false, index: true },
    isArchived: { type: Boolean, default: false, index: true },
    isDraft: { type: Boolean, default: false, index: true },
    isSent: { type: Boolean, default: false, index: true },
    isTrash: { type: Boolean, default: false, index: true },
    hasAttachments: { type: Boolean, default: false },
    messageIdHeader: { type: String },
    inReplyTo: { type: String },
    references: { type: String },
    receivedAt: { type: Date, required: true, index: true },
    internalDate: { type: Number, required: true },
    aiAnalysis: { type: Schema.Types.ObjectId, ref: 'AIAnalysis' },
  },
  {
    timestamps: true,
  }
);

EmailSchema.index({ userId: 1, gmailMessageId: 1 }, { unique: true });
EmailSchema.index({ userId: 1, isTrash: 1, isArchived: 1, isSent: 1, receivedAt: -1 });
EmailSchema.index({ userId: 1, gmailThreadId: 1, receivedAt: 1 });

export const Email = mongoose.model<IEmail>('Email', EmailSchema);
