import { describe, it, expect } from 'vitest';
import { encrypt, decrypt } from './encryption.js';

describe('Encryption Utility (AES-256-GCM)', () => {
  it('should encrypt and decrypt plaintext accurately', () => {
    const originalSecret = 'ya29.a0AfH6SMDh_very_secret_oauth_access_token_12345';
    const encrypted = encrypt(originalSecret);

    expect(encrypted).toBeDefined();
    expect(encrypted).not.toEqual(originalSecret);
    expect(encrypted.split(':').length).toBe(3); // iv : authTag : ciphertext

    const decrypted = decrypt(encrypted);
    expect(decrypted).toEqual(originalSecret);
  });

  it('should handle empty or null strings safely', () => {
    expect(encrypt('')).toBe('');
    expect(decrypt('')).toBe('');
  });

  it('should fail cleanly on tampered ciphertext', () => {
    const original = 'secret_token';
    const encrypted = encrypt(original);
    const [iv, authTag, cipher] = encrypted.split(':');
    const tampered = `${iv}:${authTag}:ff${cipher.slice(2)}`;

    expect(() => decrypt(tampered)).toThrow();
  });
});
