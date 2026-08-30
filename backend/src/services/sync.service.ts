import { ConnectedAccount, IConnectedAccount } from '../models/ConnectedAccount.js';
import { Email, IEmail } from '../models/Email.js';
import { EmailThread } from '../models/EmailThread.js';
import { AIAnalysis } from '../models/AIAnalysis.js';
import { GmailService } from './gmail.service.js';
import { AIService } from './ai.service.js';
import { isDbConnected } from '../config/db.js';

export class SyncService {
  /**
   * Synchronizes recent mailbox messages for a user
   */
  static async syncMailbox(userId: string, maxMessages = 25): Promise<{ syncedCount: number; newCount: number }> {
    if (!isDbConnected()) {
      return { syncedCount: 0, newCount: 0 };
    }

    const { client, account } = await GmailService.getClientForUser(userId);

    account.syncStatus = 'syncing';
    await account.save();

    try {
      // 1. Fetch message list from Gmail
      const { messages } = await client.listMessages({ maxResults: maxMessages });
      let syncedCount = 0;
      let newCount = 0;

      for (const msgMeta of messages) {
        if (!msgMeta.id) continue;

        // Check if message already exists locally
        const existing = await Email.findOne({ userId, gmailMessageId: msgMeta.id });
        if (existing) {
          syncedCount++;
          continue;
        }

        // Fetch full message details
        const parsed = await client.getMessage(msgMeta.id);

        const isRead = !parsed.labels.includes('UNREAD');
        const isStarred = parsed.labels.includes('STARRED');
        const isTrash = parsed.labels.includes('TRASH');
        const isDraft = parsed.labels.includes('DRAFT');
        const isSent = parsed.labels.includes('SENT');
        const isArchived = !parsed.labels.includes('INBOX') && !isSent && !isTrash && !isDraft;

        // Create Email document
        const emailDoc = await Email.create({
          userId,
          connectedAccountId: account._id,
          gmailMessageId: parsed.id,
          gmailThreadId: parsed.threadId,
          from: parsed.from,
          to: parsed.to,
          cc: parsed.cc,
          bcc: parsed.bcc,
          subject: parsed.subject,
          snippet: parsed.snippet,
          bodyText: parsed.bodyText,
          bodyHtml: parsed.bodyHtml,
          labels: parsed.labels,
          isRead,
          isStarred,
          isArchived,
          isDraft,
          isSent,
          isTrash,
          hasAttachments: parsed.hasAttachments,
          messageIdHeader: parsed.messageIdHeader,
          inReplyTo: parsed.inReplyTo,
          references: parsed.references,
          receivedAt: parsed.date,
          internalDate: parsed.date.getTime(),
        });

        // Upsert Thread
        await EmailThread.findOneAndUpdate(
          { userId, gmailThreadId: parsed.threadId },
          {
            $set: {
              connectedAccountId: account._id,
              subject: parsed.subject,
              snippet: parsed.snippet,
              lastMessageDate: parsed.date,
              isRead,
              isStarred,
              isArchived,
              isTrash,
              labels: parsed.labels,
            },
            $inc: { messageCount: 1 },
            $addToSet: {
              participants: {
                name: parsed.from.name,
                email: parsed.from.email,
              },
            },
          },
          { upsert: true, new: true }
        );

        syncedCount++;
        newCount++;

        // Trigger background initial AI analysis for unread messages if gemini key is available
        AIService.triggerBackgroundAnalysis(userId, emailDoc._id.toString()).catch((err) => {
          console.warn(`Background AI analysis skipped for ${parsed.id}:`, err.message);
        });
      }

      account.syncStatus = 'idle';
      account.lastSyncedAt = new Date();
      await account.save();

      return { syncedCount, newCount };
    } catch (error: any) {
      account.syncStatus = 'error';
      account.syncError = error.message;
      await account.save();
      console.error('❌ Sync failed:', error.message);
      throw error;
    }
  }
}
