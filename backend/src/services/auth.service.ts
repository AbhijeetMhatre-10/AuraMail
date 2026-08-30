import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User, IUser } from '../models/User.js';
import { ConnectedAccount, IConnectedAccount } from '../models/ConnectedAccount.js';
import { GoogleOAuthClient } from '../integrations/google/gmail.client.js';
import { encrypt, decrypt } from '../utils/encryption.js';
import { AppError } from '../utils/errors.js';
import { DEMO_USER_DATA, DEMO_USER_ID } from './demoData.service.js';
import { isDbConnected } from '../config/db.js';

export interface JwtPayload {
  userId: string;
  email: string;
  isDemoUser?: boolean;
}

export class AuthService {
  /**
   * Generates JWT session token
   */
  static generateSessionToken(payload: JwtPayload): string {
    return jwt.sign(payload, env.SESSION_SECRET, {
      expiresIn: '7d',
    });
  }

  /**
   * Verifies and decodes JWT session token
   */
  static verifySessionToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, env.SESSION_SECRET) as JwtPayload;
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        throw AppError.unauthorized('Session has expired. Please sign in again.', 'AUTH_EXPIRED');
      }
      throw AppError.unauthorized('Invalid session token.', 'AUTH_REQUIRED');
    }
  }

  /**
   * Returns Google OAuth authorization URL
   */
  static getGoogleAuthUrl(state?: string): string {
    return GoogleOAuthClient.getAuthUrl(state);
  }

  /**
   * Handles Google OAuth callback: exchanges code, encrypts tokens, upserts user and account
   */
  static async handleGoogleCallback(code: string): Promise<{ token: string; user: IUser; account: IConnectedAccount }> {
    const { tokens, user: googleUser } = await GoogleOAuthClient.exchangeCodeForTokens(code);

    if (!tokens.access_token) {
      throw AppError.unauthorized('No access token returned by Google');
    }

    const encryptedAccessToken = encrypt(tokens.access_token);
    const encryptedRefreshToken = tokens.refresh_token ? encrypt(tokens.refresh_token) : '';
    const tokenExpiresAt = new Date(Date.now() + (tokens.expiry_date ? tokens.expiry_date - Date.now() : 3600 * 1000));

    let user: IUser | null = null;
    let account: IConnectedAccount | null = null;

    if (isDbConnected()) {
      // Find or create User
      user = await User.findOneAndUpdate(
        { googleId: googleUser.googleId },
        {
          email: googleUser.email,
          name: googleUser.name,
          picture: googleUser.picture,
          isDemoUser: false,
          lastLogin: new Date(),
        },
        { upsert: true, new: true }
      );

      if (!user) {
        throw AppError.internal('Failed to create or find user');
      }

      // Find or create ConnectedAccount with encrypted tokens
      account = await ConnectedAccount.findOneAndUpdate(
        { userId: user._id, email: googleUser.email },
        {
          provider: 'google',
          googleAccountId: googleUser.googleId,
          scopes: tokens.scope?.split(' ') || [],
          encryptedAccessToken,
          ...(encryptedRefreshToken ? { encryptedRefreshToken } : {}),
          tokenExpiresAt,
          isConnected: true,
          syncStatus: 'idle',
        },
        { upsert: true, new: true }
      );
    } else {
      // In-memory runtime fallback if database is not active
      user = {
        _id: new (User as any).base.Types.ObjectId(),
        googleId: googleUser.googleId,
        email: googleUser.email,
        name: googleUser.name,
        picture: googleUser.picture,
        isDemoUser: false,
        preferences: { defaultTone: 'Professional', autoSummarize: true, autoCategorize: true, theme: 'dark' },
        lastLogin: new Date(),
      } as any;

      account = {
        userId: (user as any)._id,
        provider: 'google',
        email: googleUser.email,
        googleAccountId: googleUser.googleId,
        encryptedAccessToken,
        encryptedRefreshToken,
        tokenExpiresAt,
        isConnected: true,
        syncStatus: 'idle',
      } as any;
    }

    const sessionToken = this.generateSessionToken({
      userId: (user! as any)._id.toString(),
      email: user!.email,
      isDemoUser: false,
    });

    return { token: sessionToken, user: user!, account: account! };
  }

  /**
   * Logs in as Demo User with strictly isolated tenancy and realistic seed mailbox
   */
  static async loginAsDemo(): Promise<{ token: string; user: any; isDemo: true }> {
    const sessionToken = this.generateSessionToken({
      userId: DEMO_USER_ID.toString(),
      email: DEMO_USER_DATA.email!,
      isDemoUser: true,
    });

    return {
      token: sessionToken,
      user: DEMO_USER_DATA,
      isDemo: true,
    };
  }

  /**
   * Fetches the authenticated user profile and connected account metadata
   */
  static async getMe(userId: string, isDemoUser?: boolean) {
    if (isDemoUser || userId === DEMO_USER_ID.toString()) {
      return {
        user: DEMO_USER_DATA,
        account: {
          email: DEMO_USER_DATA.email,
          provider: 'google',
          isConnected: true,
          syncStatus: 'idle',
          lastSyncedAt: new Date(),
          isDemo: true,
        },
        isDemo: true,
      };
    }

    if (isDbConnected()) {
      const user = await User.findById(userId);
      if (!user) {
        throw AppError.notFound('User not found');
      }

      const account = await ConnectedAccount.findOne({ userId: user._id, isConnected: true });

      return {
        user,
        account: account
          ? {
              email: account.email,
              provider: account.provider,
              isConnected: account.isConnected,
              syncStatus: account.syncStatus,
              lastSyncedAt: account.lastSyncedAt,
              isDemo: false,
            }
          : null,
        isDemo: false,
      };
    }

    return {
      user: DEMO_USER_DATA,
      account: null,
      isDemo: false,
    };
  }

  /**
   * Disconnects a user's Gmail account and deletes sensitive credentials
   */
  static async disconnectAccount(userId: string, isDemoUser?: boolean) {
    if (isDemoUser) {
      return { success: true, message: 'Demo account reset.' };
    }

    if (isDbConnected()) {
      await ConnectedAccount.updateMany(
        { userId },
        {
          isConnected: false,
          encryptedAccessToken: '',
          encryptedRefreshToken: '',
        }
      );
    }

    return { success: true, message: 'Account successfully disconnected.' };
  }
}
