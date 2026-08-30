import { ConnectedAccount, IConnectedAccount } from '../models/ConnectedAccount.js';
import { GoogleOAuthClient, GmailApiClient } from '../integrations/google/gmail.client.js';
import { decrypt, encrypt } from '../utils/encryption.js';
import { AppError } from '../utils/errors.js';

export class GmailService {
  /**
   * Retrieves an authenticated GmailApiClient instance for a connected account
   */
  static async getClientForAccount(account: IConnectedAccount): Promise<GmailApiClient> {
    if (!account.encryptedAccessToken) {
      throw AppError.unauthorized('Account is not connected to Gmail', 'AUTH_REQUIRED');
    }

    const accessToken = decrypt(account.encryptedAccessToken);
    const refreshToken = account.encryptedRefreshToken ? decrypt(account.encryptedRefreshToken) : undefined;

    const authClient = GoogleOAuthClient.createAuthenticatedClient(
      accessToken,
      refreshToken,
      async (newTokens) => {
        // Callback when tokens are refreshed by Google SDK
        if (newTokens.access_token) {
          account.encryptedAccessToken = encrypt(newTokens.access_token);
        }
        if (newTokens.refresh_token) {
          account.encryptedRefreshToken = encrypt(newTokens.refresh_token);
        }
        if (newTokens.expiry_date) {
          account.tokenExpiresAt = new Date(newTokens.expiry_date);
        }
        await account.save();
      }
    );

    return new GmailApiClient(authClient);
  }

  /**
   * Retrieves authenticated client by userId
   */
  static async getClientForUser(userId: string): Promise<{ client: GmailApiClient; account: IConnectedAccount }> {
    const account = await ConnectedAccount.findOne({ userId, isConnected: true });
    if (!account) {
      throw AppError.unauthorized('No active Gmail account connected for this user.', 'AUTH_REQUIRED');
    }

    const client = await this.getClientForAccount(account);
    return { client, account };
  }
}
