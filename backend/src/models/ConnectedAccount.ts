import mongoose, { Schema, Document } from 'mongoose';

export interface IConnectedAccount extends Document {
  userId: mongoose.Types.ObjectId;
  provider: 'google';
  email: string;
  googleAccountId: string;
  scopes: string[];
  encryptedAccessToken: string;
  encryptedRefreshToken: string;
  tokenExpiresAt: Date;
  isConnected: boolean;
  syncStatus: 'idle' | 'syncing' | 'error';
  lastSyncedAt?: Date;
  historyId?: string;
  syncError?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ConnectedAccountSchema = new Schema<IConnectedAccount>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    provider: { type: String, enum: ['google'], default: 'google', required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    googleAccountId: { type: String, required: true },
    scopes: [{ type: String }],
    encryptedAccessToken: { type: String, required: true },
    encryptedRefreshToken: { type: String, default: '' },
    tokenExpiresAt: { type: Date, required: true },
    isConnected: { type: Boolean, default: true, index: true },
    syncStatus: {
      type: String,
      enum: ['idle', 'syncing', 'error'],
      default: 'idle',
    },
    lastSyncedAt: { type: Date },
    historyId: { type: String },
    syncError: { type: String },
  },
  {
    timestamps: true,
  }
);

ConnectedAccountSchema.index({ userId: 1, email: 1 }, { unique: true });

export const ConnectedAccount = mongoose.model<IConnectedAccount>('ConnectedAccount', ConnectedAccountSchema);
