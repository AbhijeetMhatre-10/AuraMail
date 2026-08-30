import mongoose, { Schema, Document } from 'mongoose';

export type ActivityActionType =
  | 'read'
  | 'unread'
  | 'star'
  | 'unstar'
  | 'archive'
  | 'delete'
  | 'send'
  | 'reply'
  | 'reply_all'
  | 'ai_summarize'
  | 'ai_reply'
  | 'ai_classify'
  | 'ai_rewrite'
  | 'ai_explain'
  | 'ai_smart_search'
  | 'sync'
  | 'account_connected'
  | 'account_disconnected';

export interface IEmailActivity extends Document {
  userId: mongoose.Types.ObjectId;
  emailId?: mongoose.Types.ObjectId;
  gmailMessageId?: string;
  gmailThreadId?: string;
  action: ActivityActionType;
  title: string;
  details?: Record<string, any>;
  timestamp: Date;
}

const EmailActivitySchema = new Schema<IEmailActivity>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    emailId: { type: Schema.Types.ObjectId, ref: 'Email', index: true },
    gmailMessageId: { type: String, index: true },
    gmailThreadId: { type: String },
    action: {
      type: String,
      required: true,
      index: true,
    },
    title: { type: String, required: true },
    details: { type: Schema.Types.Mixed },
    timestamp: { type: Date, default: Date.now, index: true },
  },
  {
    timestamps: false,
  }
);

EmailActivitySchema.index({ userId: 1, timestamp: -1 });

export const EmailActivity = mongoose.model<IEmailActivity>('EmailActivity', EmailActivitySchema);
