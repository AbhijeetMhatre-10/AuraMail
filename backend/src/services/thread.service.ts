import { Email } from '../models/Email.js';
import { EmailThread } from '../models/EmailThread.js';
import { DemoDataStore, DEMO_USER_ID } from './demoData.service.js';
import { AppError } from '../utils/errors.js';
import { isDbConnected } from '../config/db.js';

export class ThreadService {
  /**
   * Fetches full thread conversation with chronological messages
   */
  static async getThread(userId: string, threadId: string, isDemoUser?: boolean) {
    if (isDemoUser || userId === DEMO_USER_ID.toString()) {
      const thread = DemoDataStore.getThread(threadId);
      if (!thread || thread.messages.length === 0) {
        // Try searching if threadId is an email id
        const email = DemoDataStore.getEmailById(threadId);
        if (email) {
          return DemoDataStore.getThread(email.threadId);
        }
        throw AppError.notFound('Thread not found');
      }
      return thread;
    }

    if (!isDbConnected()) throw AppError.notFound('Database unavailable');

    const [threadMeta, messages] = await Promise.all([
      EmailThread.findOne({ userId, gmailThreadId: threadId }).populate('latestAIAnalysis'),
      Email.find({ userId, gmailThreadId: threadId, isTrash: false })
        .populate('aiAnalysis')
        .sort({ receivedAt: 1 }),
    ]);

    if (!messages || messages.length === 0) {
      // Check if threadId was passed as an email ID
      const singleEmail = await Email.findOne({ _id: threadId, userId }).populate('aiAnalysis');
      if (singleEmail) {
        const threadMessages = await Email.find({
          userId,
          gmailThreadId: singleEmail.gmailThreadId,
          isTrash: false,
        })
          .populate('aiAnalysis')
          .sort({ receivedAt: 1 });

        return {
          id: singleEmail.gmailThreadId,
          messages: threadMessages,
          subject: singleEmail.subject,
        };
      }
      throw AppError.notFound('Thread not found');
    }

    return {
      id: threadId,
      metadata: threadMeta,
      messages,
      subject: messages[0]?.subject || '(No Subject)',
    };
  }
}
