import { google } from 'googleapis';
import { env } from '../../config/env.js';
import { AppError } from '../../utils/errors.js';
import { buildRawEmail, parseGmailMessage, ParsedGmailMessage } from '../../utils/emailParser.js';

export const GMAIL_SCOPES = [
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/gmail.compose',
  'https://www.googleapis.com/auth/gmail.send',
];

export class GoogleOAuthClient {
  static getOAuth2Client() {
    if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
      throw AppError.badRequest('Google OAuth credentials (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET) are not configured.');
    }

    return new google.auth.OAuth2(
      env.GOOGLE_CLIENT_ID,
      env.GOOGLE_CLIENT_SECRET,
      env.GOOGLE_REDIRECT_URI
    );
  }

  /**
   * Generates authorization URL for Google OAuth consent flow
   */
  static getAuthUrl(state?: string): string {
    const oauth2Client = this.getOAuth2Client();
    return oauth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent', // Ensures refresh token is provided
      scope: GMAIL_SCOPES,
      state: state || undefined,
    });
  }

  /**
   * Exchanges authorization code for tokens and fetches user profile
   */
  static async exchangeCodeForTokens(code: string) {
    const oauth2Client = this.getOAuth2Client();
    try {
      const { tokens } = await oauth2Client.getToken(code);
      oauth2Client.setCredentials(tokens);

      const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
      const userinfo = await oauth2.userinfo.get();

      return {
        tokens,
        user: {
          googleId: userinfo.data.id!,
          email: userinfo.data.email!,
          name: userinfo.data.name || userinfo.data.email!.split('@')[0],
          picture: userinfo.data.picture || '',
        },
      };
    } catch (error: any) {
      console.error('❌ Google code exchange failed:', error.message);
      throw AppError.unauthorized(`OAuth exchange failed: ${error.message}`);
    }
  }

  /**
   * Creates an authenticated OAuth2 client with user tokens and auto-refresh handler
   */
  static createAuthenticatedClient(
    accessToken: string,
    refreshToken?: string,
    onTokenRefreshed?: (tokens: any) => Promise<void>
  ) {
    const oauth2Client = this.getOAuth2Client();
    oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (onTokenRefreshed) {
      oauth2Client.on('tokens', async (tokens) => {
        try {
          await onTokenRefreshed(tokens);
        } catch (err) {
          console.error('⚠️ Failed to save refreshed OAuth tokens:', err);
        }
      });
    }

    return oauth2Client;
  }
}

export class GmailApiClient {
  private gmail: ReturnType<typeof google.gmail>;

  constructor(authClient: any) {
    this.gmail = google.gmail({ version: 'v1', auth: authClient });
  }

  /**
   * Fetches user Gmail profile (email, messagesTotal, historyId)
   */
  async getProfile() {
    try {
      const res = await this.gmail.users.getProfile({ userId: 'me' });
      return res.data;
    } catch (error: any) {
      throw AppError.gmailError(`Failed to fetch Gmail profile: ${error.message}`);
    }
  }

  /**
   * Lists messages matching query or labels
   */
  async listMessages(options: {
    q?: string;
    labelIds?: string[];
    maxResults?: number;
    pageToken?: string;
    includeSpamTrash?: boolean;
  }) {
    try {
      const res = await this.gmail.users.messages.list({
        userId: 'me',
        q: options.q,
        labelIds: options.labelIds,
        maxResults: options.maxResults || 25,
        pageToken: options.pageToken,
        includeSpamTrash: options.includeSpamTrash || false,
      });

      return {
        messages: res.data.messages || [],
        nextPageToken: res.data.nextPageToken || undefined,
        resultSizeEstimate: res.data.resultSizeEstimate || 0,
      };
    } catch (error: any) {
      throw AppError.gmailError(`Failed to list messages: ${error.message}`);
    }
  }

  /**
   * Gets single full message by ID
   */
  async getMessage(messageId: string): Promise<ParsedGmailMessage> {
    try {
      const res = await this.gmail.users.messages.get({
        userId: 'me',
        id: messageId,
        format: 'full',
      });
      return parseGmailMessage(res.data);
    } catch (error: any) {
      throw AppError.gmailError(`Failed to get message ${messageId}: ${error.message}`);
    }
  }

  /**
   * Gets full thread with all messages
   */
  async getThread(threadId: string): Promise<{
    id: string;
    messages: ParsedGmailMessage[];
  }> {
    try {
      const res = await this.gmail.users.threads.get({
        userId: 'me',
        id: threadId,
        format: 'full',
      });

      const messages = (res.data.messages || []).map((m: any) => parseGmailMessage(m));
      return {
        id: res.data.id || threadId,
        messages,
      };
    } catch (error: any) {
      throw AppError.gmailError(`Failed to get thread ${threadId}: ${error.message}`);
    }
  }

  /**
   * Modifies labels on a message (e.g. read/unread, star, archive)
   */
  async modifyMessageLabels(messageId: string, addLabelIds: string[] = [], removeLabelIds: string[] = []) {
    try {
      const res = await this.gmail.users.messages.modify({
        userId: 'me',
        id: messageId,
        requestBody: {
          addLabelIds,
          removeLabelIds,
        },
      });
      return res.data;
    } catch (error: any) {
      throw AppError.gmailError(`Failed to modify labels on ${messageId}: ${error.message}`);
    }
  }

  /**
   * Moves a message to Trash
   */
  async trashMessage(messageId: string) {
    try {
      const res = await this.gmail.users.messages.trash({
        userId: 'me',
        id: messageId,
      });
      return res.data;
    } catch (error: any) {
      throw AppError.gmailError(`Failed to trash message ${messageId}: ${error.message}`);
    }
  }

  /**
   * Permanently deletes a message
   */
  async deleteMessage(messageId: string) {
    try {
      const res = await this.gmail.users.messages.delete({
        userId: 'me',
        id: messageId,
      });
      return res.data;
    } catch (error: any) {
      throw AppError.gmailError(`Failed to delete message ${messageId}: ${error.message}`);
    }
  }

  /**
   * Sends a new email or a threaded reply
   */
  async sendEmail(options: {
    from: string;
    to: string[];
    cc?: string[];
    bcc?: string[];
    subject: string;
    body: string;
    isHtml?: boolean;
    inReplyTo?: string;
    references?: string;
    threadId?: string;
  }) {
    try {
      const raw = buildRawEmail(options);
      const res = await this.gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw,
          threadId: options.threadId || undefined,
        },
      });

      return {
        id: res.data.id!,
        threadId: res.data.threadId!,
        labelIds: res.data.labelIds || [],
      };
    } catch (error: any) {
      throw AppError.gmailError(`Failed to send email: ${error.message}`);
    }
  }
}
