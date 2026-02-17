import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { encrypt, decrypt } from '../encryption';

describe('encryption utilities', () => {
  const originalEnv = process.env.ENCRYPTION_KEY;
  const validKey = 'a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456';

  beforeEach(() => {
    process.env.ENCRYPTION_KEY = validKey;
  });

  afterEach(() => {
    process.env.ENCRYPTION_KEY = originalEnv;
  });

  describe('encrypt', () => {
    it('should encrypt plaintext successfully', () => {
      const plaintext = 'sk-proj-test-api-key-12345';
      const encrypted = encrypt(plaintext);

      expect(encrypted).toBeDefined();
      expect(encrypted).not.toBe(plaintext);
      expect(encrypted.split(':')).toHaveLength(3); // iv:tag:ciphertext
    });

    it('should produce different ciphertexts for same plaintext (random IV)', () => {
      const plaintext = 'sk-proj-test';
      const encrypted1 = encrypt(plaintext);
      const encrypted2 = encrypt(plaintext);

      expect(encrypted1).not.toBe(encrypted2);
    });

    it('should throw if ENCRYPTION_KEY is not set', () => {
      delete process.env.ENCRYPTION_KEY;

      expect(() => encrypt('test')).toThrow('ENCRYPTION_KEY environment variable is not set');
    });

    it('should throw if ENCRYPTION_KEY is wrong length', () => {
      process.env.ENCRYPTION_KEY = 'tooshort';

      expect(() => encrypt('test')).toThrow('ENCRYPTION_KEY must be 64 characters');
    });

    it('should handle empty string', () => {
      const encrypted = encrypt('');
      expect(encrypted).toBeDefined();
      expect(encrypted.split(':')).toHaveLength(3);
    });

    it('should handle long API keys', () => {
      const longKey = 'sk-proj-' + 'a'.repeat(200);
      const encrypted = encrypt(longKey);
      expect(encrypted).toBeDefined();
    });

    it('should handle special characters', () => {
      const specialChars = 'sk-proj-!@#$%^&*()_+-={}[]|:;<>?,./~`';
      const encrypted = encrypt(specialChars);
      expect(encrypted).toBeDefined();
    });
  });

  describe('decrypt', () => {
    it('should decrypt ciphertext successfully', () => {
      const plaintext = 'sk-proj-test-api-key-12345';
      const encrypted = encrypt(plaintext);
      const decrypted = decrypt(encrypted);

      expect(decrypted).toBe(plaintext);
    });

    it('should throw if ciphertext format is invalid', () => {
      expect(() => decrypt('invalid')).toThrow('Invalid encrypted data format');
      expect(() => decrypt('only:two')).toThrow('Invalid encrypted data format');
      expect(() => decrypt('too:many:parts:here')).toThrow('Invalid encrypted data format');
    });

    it('should throw if IV length is invalid', () => {
      const invalidIv = 'short:' + 'a'.repeat(32) + ':' + 'b'.repeat(32);
      expect(() => decrypt(invalidIv)).toThrow('Invalid IV length');
    });

    it('should throw if tag length is invalid', () => {
      const validIv = 'a'.repeat(32); // 16 bytes in hex
      const invalidTag = 'short';
      const ciphertext = 'b'.repeat(32);
      const invalidData = `${validIv}:${invalidTag}:${ciphertext}`;

      expect(() => decrypt(invalidData)).toThrow('Invalid authentication tag length');
    });

    it('should throw if data has been tampered with (authentication failure)', () => {
      const plaintext = 'sk-proj-test';
      const encrypted = encrypt(plaintext);
      const parts = encrypted.split(':');

      // Tamper with ciphertext
      const tamperedCiphertext = parts[2].slice(0, -2) + 'ff';
      const tampered = `${parts[0]}:${parts[1]}:${tamperedCiphertext}`;

      expect(() => decrypt(tampered)).toThrow();
    });

    it('should throw if ENCRYPTION_KEY is not set', () => {
      const encrypted = encrypt('test');
      delete process.env.ENCRYPTION_KEY;

      expect(() => decrypt(encrypted)).toThrow('ENCRYPTION_KEY environment variable is not set');
    });

    it('should throw if decrypted with wrong key', () => {
      const plaintext = 'sk-proj-test';
      const encrypted = encrypt(plaintext);

      // Change encryption key
      process.env.ENCRYPTION_KEY = 'b'.repeat(64);

      expect(() => decrypt(encrypted)).toThrow();
    });

    it('should handle empty string round-trip', () => {
      const plaintext = '';
      const encrypted = encrypt(plaintext);
      const decrypted = decrypt(encrypted);

      expect(decrypted).toBe(plaintext);
    });

    it('should handle long strings round-trip', () => {
      const plaintext = 'sk-proj-' + 'x'.repeat(500);
      const encrypted = encrypt(plaintext);
      const decrypted = decrypt(encrypted);

      expect(decrypted).toBe(plaintext);
    });

    it('should handle special characters round-trip', () => {
      const plaintext = 'sk-proj-!@#$%^&*()_+-={}[]|:;<>?,./~`\n\t\r';
      const encrypted = encrypt(plaintext);
      const decrypted = decrypt(encrypted);

      expect(decrypted).toBe(plaintext);
    });

    it('should handle unicode characters round-trip', () => {
      const plaintext = 'sk-proj-🔐🗝️密钥ключ';
      const encrypted = encrypt(plaintext);
      const decrypted = decrypt(encrypted);

      expect(decrypted).toBe(plaintext);
    });
  });

  describe('integration', () => {
    it('should encrypt and decrypt multiple times correctly', () => {
      const plaintext = 'sk-proj-test-api-key';

      for (let i = 0; i < 10; i++) {
        const encrypted = encrypt(plaintext);
        const decrypted = decrypt(encrypted);
        expect(decrypted).toBe(plaintext);
      }
    });

    it('should handle multiple different plaintexts', () => {
      const plaintexts = [
        'sk-proj-short',
        'sk-proj-' + 'a'.repeat(100),
        'sk-proj-special-!@#$%',
        '',
        'sk-proj-unicode-🔐',
      ];

      plaintexts.forEach((plaintext) => {
        const encrypted = encrypt(plaintext);
        const decrypted = decrypt(encrypted);
        expect(decrypted).toBe(plaintext);
      });
    });
  });
});
