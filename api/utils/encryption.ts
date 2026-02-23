import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

/**
 * AES-256-GCM encryption/decryption utilities for secure API key storage
 *
 * @requires ENCRYPTION_KEY environment variable (64-character hex string)
 * @example
 * // Generate key: openssl rand -hex 32
 * // Set in .env: ENCRYPTION_KEY=your_64_char_hex_string
 */

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // AES block size
const TAG_LENGTH = 16; // Authentication tag length
const KEY_LENGTH = 32; // 256 bits

/**
 * Get encryption key from environment
 * @throws Error if ENCRYPTION_KEY is not set or invalid
 */
function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;

  if (!key) {
    throw new Error('ENCRYPTION_KEY environment variable is not set');
  }

  if (key.length !== 64) {
    throw new Error('ENCRYPTION_KEY must be 64 characters (32 bytes in hex)');
  }

  const keyBuffer = Buffer.from(key, 'hex');

  if (keyBuffer.length !== KEY_LENGTH) {
    throw new Error('Invalid ENCRYPTION_KEY format');
  }

  return keyBuffer;
}

/**
 * Encrypt plaintext using AES-256-GCM
 *
 * @param plaintext - The text to encrypt (e.g., API key)
 * @returns Encrypted string in format: iv:tag:ciphertext (hex-encoded)
 * @throws Error if encryption fails or ENCRYPTION_KEY is invalid
 *
 * @example
 * const encrypted = encrypt('sk-proj-...');
 * // Returns: "a1b2c3d4...e5f6:g7h8i9j0...k1l2:m3n4o5p6..."
 */
export function encrypt(plaintext: string): string {
  const key = getEncryptionKey();
  const iv = randomBytes(IV_LENGTH);

  const cipher = createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const tag = cipher.getAuthTag();

  // Return format: iv:tag:ciphertext
  return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted}`;
}

/**
 * Decrypt ciphertext using AES-256-GCM
 *
 * @param encryptedData - Encrypted string in format: iv:tag:ciphertext (hex-encoded)
 * @returns Decrypted plaintext
 * @throws Error if decryption fails (wrong key, tampered data, or invalid format)
 *
 * @example
 * const decrypted = decrypt('a1b2c3d4...e5f6:g7h8i9j0...k1l2:m3n4o5p6...');
 * // Returns: "sk-proj-..."
 */
export function decrypt(encryptedData: string): string {
  const key = getEncryptionKey();

  // Parse format: iv:tag:ciphertext
  const parts = encryptedData.split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted data format');
  }

  const [ivHex, tagHex, ciphertext] = parts;

  const iv = Buffer.from(ivHex, 'hex');
  const tag = Buffer.from(tagHex, 'hex');

  if (iv.length !== IV_LENGTH) {
    throw new Error('Invalid IV length');
  }

  if (tag.length !== TAG_LENGTH) {
    throw new Error('Invalid authentication tag length');
  }

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}
