import mongoose from 'mongoose';
import { Email, IEmail } from '../models/Email.js';
import { EmailThread } from '../models/EmailThread.js';
import { AIAnalysis } from '../models/AIAnalysis.js';
import { EmailActivity } from '../models/EmailActivity.js';
import { GmailService } from './gmail.service.js';
import { DemoDataStore, DEMO_USER_ID } from './demoData.service.js';
import { AppError } from '../utils/errors.js';
import { isDbConnected } from '../config/db.js';

export interface EmailQueryOptions {
  folder?: 'inbox' | 'starred' | 'sent' | 'archive' | 'trash';
  category?: string;
  priority?: string;
  unreadOnly?: boolean;
  query?: string;
  page?: number;
  limit?: number;
}

export class EmailService {
  /**
   * List emails with rich filtering and populated AI metadata
   */
  static async listEmails(userId: string, options: EmailQueryOptions, isDemoUser?: boolean) {
    if (isDemoUser || userId === DEMO_USER_ID.toString()) {
      const all = DemoDataStore.getEmails(options);
      const page = options.page || 1;
      const limit = options.limit || 20;
      const paginated = all.slice((page - 1) * limit, page * limit);
      return {
        emails: paginated,
        total: all.length,
        page,
        limit,
        totalPages: Math.ceil(all.length / limit),
      };
    }

    if (!isDbConnected()) {
      return { emails: [], total: 0, page: 1, limit: 20, totalPages: 0 };
    }

    const filter: any = { userId };
    const folder = options.folder || 'inbox';

    if (folder === 'inbox') {
      filter.isArchived = false;
      filter.isTrash = false;
      filter.isSent = false;
    } else if (folder === 'starred') {
      filter.isStarred = true;
      filter.isTrash = false;
    } else if (folder === 'sent') {
      filter.isSent = true;
      filter.isTrash = false;
    } else if (folder === 'archive') {
      filter.isArchived = true;
      filter.isTrash = false;
    } else if (folder === 'trash') {
      filter.isTrash = true;
    }

    if (options.unreadOnly) {
      filter.isRead = false;
    }

    if (options.query) {
      const q = options.query;
      filter.$or = [
        { subject: { $regex: q, $options: 'i' } },
        { snippet: { $regex: q, $options: 'i' } },
        { 'from.name': { $regex: q, $options: 'i' } },
        { 'from.email': { $regex: q, $options: 'i' } },
      ];
    }

    const page = options.page || 1;
    const limit = options.limit || 20;
    const skip = (page - 1) * limit;

    const [emails, total] = await Promise.all([
      Email.find(filter)
        .populate('aiAnalysis')
        .sort({ receivedAt: -1 })
        .skip(skip)
        .limit(limit),
      Email.countDocuments(filter),
    ]);

    return {
      emails,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get single email by ID
   */
  static async getEmailById(userId: string, emailId: string, isDemoUser?: boolean) {
    if (isDemoUser || userId === DEMO_USER_ID.toString()) {
      const demoEmail = DemoDataStore.getEmailById(emailId);
      if (!demoEmail) throw AppError.notFound('Email not found');
      return demoEmail;
    }

    if (!isDbConnected()) throw AppError.notFound('Database unavailable');

    const email = await Email.findOne({ _id: emailId, userId }).populate('aiAnalysis');
    if (!email) throw AppError.notFound('Email not found');
    return email;
  }

  /**
   * Mark read/unread
   */
  static async setReadState(userId: string, emailId: string, isRead: boolean, isDemoUser?: boolean) {
    if (isDemoUser || userId === DEMO_USER_ID.toString()) {
      return DemoDataStore.markRead(emailId, isRead);
    }

    const email = await Email.findOne({ _id: emailId, userId });
    if (!email) throw AppError.notFound('Email not found');

    // Update Gmail labels
    try {
      const { client } = await GmailService.getClientForUser(userId);
      if (isRead) {
        await client.modifyMessageLabels(email.gmailMessageId, [], ['UNREAD']);
      } else {
        await client.modifyMessageLabels(email.gmailMessageId, ['UNREAD'], []);
      }
    } catch (err: any) {
      console.warn('Gmail API mark read/unread failed:', err.message);
    }

    email.isRead = isRead;
    await email.save();

    await EmailActivity.create({
      userId,
      emailId: email._id,
      gmailMessageId: email.gmailMessageId,
      action: isRead ? 'read' : 'unread',
      title: `Marked "${email.subject}" as ${isRead ? 'read' : 'unread'}`,
    });

    return email;
  }

  /**
   * Toggle star
   */
  static async setStarState(userId: string, emailId: string, isStarred: boolean, isDemoUser?: boolean) {
    if (isDemoUser || userId === DEMO_USER_ID.toString()) {
      return DemoDataStore.toggleStar(emailId, isStarred);
    }

    const email = await Email.findOne({ _id: emailId, userId });
    if (!email) throw AppError.notFound('Email not found');

    try {
      const { client } = await GmailService.getClientForUser(userId);
      if (isStarred) {
        await client.modifyMessageLabels(email.gmailMessageId, ['STARRED'], []);
      } else {
        await client.modifyMessageLabels(email.gmailMessageId, [], ['STARRED']);
      }
    } catch (err: any) {
      console.warn('Gmail API star/unstar failed:', err.message);
    }

    email.isStarred = isStarred;
    await email.save();

    await EmailActivity.create({
      userId,
      emailId: email._id,
      gmailMessageId: email.gmailMessageId,
      action: isStarred ? 'star' : 'unstar',
      title: `${isStarred ? 'Starred' : 'Unstarred'} "${email.subject}"`,
    });

    return email;
  }

  /**
   * Archive email
   */
  static async archiveEmail(userId: string, emailId: string, isArchived = true, isDemoUser?: boolean) {
    if (isDemoUser || userId === DEMO_USER_ID.toString()) {
      return DemoDataStore.archive(emailId, isArchived);
    }

    const email = await Email.findOne({ _id: emailId, userId });
    if (!email) throw AppError.notFound('Email not found');

    try {
      const { client } = await GmailService.getClientForUser(userId);
      if (isArchived) {
        await client.modifyMessageLabels(email.gmailMessageId, [], ['INBOX']);
      } else {
        await client.modifyMessageLabels(email.gmailMessageId, ['INBOX'], []);
      }
    } catch (err: any) {
      console.warn('Gmail API archive failed:', err.message);
    }

    email.isArchived = isArchived;
    await email.save();

    await EmailActivity.create({
      userId,
      emailId: email._id,
      gmailMessageId: email.gmailMessageId,
      action: 'archive',
      title: `Archived "${email.subject}"`,
    });

    return email;
  }

  /**
   * Delete email (move to trash)
   */
  static async deleteEmail(userId: string, emailId: string, isDemoUser?: boolean) {
    if (isDemoUser || userId === DEMO_USER_ID.toString()) {
      return DemoDataStore.deleteEmail(emailId);
    }

    const email = await Email.findOne({ _id: emailId, userId });
    if (!email) throw AppError.notFound('Email not found');

    try {
      const { client } = await GmailService.getClientForUser(userId);
      await client.trashMessage(email.gmailMessageId);
    } catch (err: any) {
      console.warn('Gmail API trash failed:', err.message);
    }

    email.isTrash = true;
    await email.save();

    await EmailActivity.create({
      userId,
      emailId: email._id,
      gmailMessageId: email.gmailMessageId,
      action: 'delete',
      title: `Moved "${email.subject}" to Trash`,
    });

    return email;
  }

  /**
   * Send new email
   */
  static async sendEmail(
    userId: string,
    payload: {
      to: string[];
      cc?: string[];
      bcc?: string[];
      subject: string;
      body: string;
      isHtml?: boolean;
    },
    isDemoUser?: boolean
  ) {
    if (isDemoUser || userId === DEMO_USER_ID.toString()) {
      return DemoDataStore.sendEmail(payload);
    }

    const { client, account } = await GmailService.getClientForUser(userId);

    const sentResult = await client.sendEmail({
      from: account.email,
      to: payload.to,
      cc: payload.cc,
      bcc: payload.bcc,
      subject: payload.subject,
      body: payload.body,
      isHtml: payload.isHtml,
    });

    // Create sent email record
    const emailDoc = await Email.create({
      userId,
      connectedAccountId: account._id,
      gmailMessageId: sentResult.id,
      gmailThreadId: sentResult.threadId,
      from: { name: account.email.split('@')[0], email: account.email, raw: account.email },
      to: payload.to.map((addr) => ({ name: addr.split('@')[0], email: addr, raw: addr })),
      cc: payload.cc?.map((addr) => ({ name: addr.split('@')[0], email: addr, raw: addr })),
      bcc: payload.bcc?.map((addr) => ({ name: addr.split('@')[0], email: addr, raw: addr })),
      subject: payload.subject,
      snippet: payload.body.slice(0, 120),
      bodyText: payload.body,
      bodyHtml: payload.isHtml ? payload.body : `<p>${payload.body.replace(/\n/g, '<br/>')}</p>`,
      labels: ['SENT'],
      isRead: true,
      isStarred: false,
      isArchived: false,
      isDraft: false,
      isSent: true,
      isTrash: false,
      receivedAt: new Date(),
      internalDate: Date.now(),
    });

    await EmailActivity.create({
      userId,
      emailId: emailDoc._id,
      gmailMessageId: sentResult.id,
      action: 'send',
      title: `Sent email: "${payload.subject}" to ${payload.to.join(', ')}`,
    });

    return emailDoc;
  }

  /**
   * Send reply or reply-all to an existing email/thread
   */
  static async sendReply(
    userId: string,
    emailId: string,
    payload: {
      body: string;
      isHtml?: boolean;
      replyAll?: boolean;
    },
    isDemoUser?: boolean
  ) {
    if (isDemoUser || userId === DEMO_USER_ID.toString()) {
      const original = DemoDataStore.getEmailById(emailId);
      if (!original) throw AppError.notFound('Email not found');

      const to = [original.from.email];
      const cc = payload.replyAll ? original.to.map((t) => t.email).filter((e) => e !== original.from.email) : [];

      return DemoDataStore.sendEmail({
        to,
        cc,
        subject: original.subject.startsWith('Re:') ? original.subject : `Re: ${original.subject}`,
        body: payload.body,
        isHtml: payload.isHtml,
        inReplyTo: original.id,
        threadId: original.threadId,
      });
    }

    const original = await Email.findOne({ _id: emailId, userId });
    if (!original) throw AppError.notFound('Original email not found');

    const { client, account } = await GmailService.getClientForUser(userId);

    const to = [original.from.email];
    let cc: string[] = [];

    if (payload.replyAll) {
      cc = original.to
        .map((t) => t.email)
        .filter((e) => e.toLowerCase() !== account.email.toLowerCase() && e.toLowerCase() !== original.from.email.toLowerCase());
      if (original.cc && original.cc.length > 0) {
        cc.push(...original.cc.map((c) => c.email).filter((e) => e.toLowerCase() !== account.email.toLowerCase()));
      }
    }

    const subject = original.subject.startsWith('Re:') ? original.subject : `Re: ${original.subject}`;

    const sentResult = await client.sendEmail({
      from: account.email,
      to,
      cc: cc.length > 0 ? cc : undefined,
      subject,
      body: payload.body,
      isHtml: payload.isHtml,
      inReplyTo: original.messageIdHeader || original.gmailMessageId,
      references: original.references ? `${original.references} ${original.messageIdHeader || original.gmailMessageId}` : original.messageIdHeader,
      threadId: original.gmailThreadId,
    });

    const replyDoc = await Email.create({
      userId,
      connectedAccountId: account._id,
      gmailMessageId: sentResult.id,
      gmailThreadId: original.gmailThreadId,
      from: { name: account.email.split('@')[0], email: account.email, raw: account.email },
      to: to.map((e) => ({ name: e.split('@')[0], email: e, raw: e })),
      cc: cc.map((e) => ({ name: e.split('@')[0], email: e, raw: e })),
      subject,
      snippet: payload.body.slice(0, 120),
      bodyText: payload.body,
      bodyHtml: payload.isHtml ? payload.body : `<p>${payload.body.replace(/\n/g, '<br/>')}</p>`,
      labels: ['SENT'],
      isRead: true,
      isStarred: false,
      isArchived: false,
      isDraft: false,
      isSent: true,
      isTrash: false,
      inReplyTo: original.gmailMessageId,
      receivedAt: new Date(),
      internalDate: Date.now(),
    });

    await EmailActivity.create({
      userId,
      emailId: replyDoc._id,
      gmailMessageId: sentResult.id,
      action: payload.replyAll ? 'reply_all' : 'reply',
      title: `Replied to "${original.subject}"`,
    });

    return replyDoc;
  }
}
