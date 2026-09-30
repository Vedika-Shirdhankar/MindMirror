// tests/unit/encryption.test.js
const { encrypt, decrypt, isEncrypted } = require('../../utils/encryption');

describe('Field-Level Encryption at Rest (AES-256-GCM)', () => {
  it('should encrypt a plaintext string into enc:v1 format', () => {
    const rawText = 'Today I felt overwhelmed with placement exams but practicing breathing helped.';
    const cipherText = encrypt(rawText);

    expect(cipherText).not.toBe(rawText);
    expect(isEncrypted(cipherText)).toBe(true);
    expect(cipherText.startsWith('enc:v1:')).toBe(true);
  });

  it('should decrypt an encrypted string back to the original plaintext', () => {
    const rawText = 'Empathetic self reflection test 123 !@#$%^&*()';
    const cipherText = encrypt(rawText);
    const decrypted = decrypt(cipherText);

    expect(decrypted).toBe(rawText);
  });

  it('should be idempotent and not double-encrypt an already encrypted string', () => {
    const rawText = 'Secret journal entry';
    const cipherText = encrypt(rawText);
    const doubleCipherText = encrypt(cipherText);

    expect(doubleCipherText).toBe(cipherText);
    expect(decrypt(doubleCipherText)).toBe(rawText);
  });

  it('should transparently return unencrypted legacy plaintext without errors', () => {
    const legacyPlaintext = 'Old journal entry before encryption was introduced.';
    expect(isEncrypted(legacyPlaintext)).toBe(false);
    expect(decrypt(legacyPlaintext)).toBe(legacyPlaintext);
  });

  it('should handle empty, null, and non-string values gracefully', () => {
    expect(encrypt('')).toBe('');
    expect(encrypt(null)).toBe(null);
    expect(encrypt(undefined)).toBe(undefined);
    expect(decrypt('')).toBe('');
    expect(decrypt(null)).toBe(null);
    expect(decrypt(undefined)).toBe(undefined);
  });
});
