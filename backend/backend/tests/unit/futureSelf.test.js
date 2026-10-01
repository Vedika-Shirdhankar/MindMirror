// tests/unit/futureSelf.test.js
const { encrypt, decrypt } = require('../../utils/encryption');

describe('Personalization & Future-Self Security Unit Tests', () => {
  test('Future-self text encryption roundtrip with AES-256-GCM', () => {
    const rawMessage = 'Dear Future Me, remember that dark clouds always pass. You survived 100% of your worst days.';
    const ciphertext = encrypt(rawMessage);

    expect(ciphertext).toBeDefined();
    expect(ciphertext.startsWith('enc:v1:')).toBe(true);
    expect(ciphertext).not.toContain(rawMessage);

    const decrypted = decrypt(ciphertext);
    expect(decrypted).toBe(rawMessage);
  });

  test('Gracefully handles empty or null future-self text', () => {
    expect(encrypt('')).toBe('');
    expect(encrypt(null)).toBe(null);
    expect(decrypt('')).toBe('');
    expect(decrypt(null)).toBe(null);
  });

  test('Prevents double-encryption on already encrypted string', () => {
    const raw = 'Keep moving forward.';
    const enc1 = encrypt(raw);
    const enc2 = encrypt(enc1);
    expect(enc2).toBe(enc1);
    expect(decrypt(enc2)).toBe(raw);
  });
});
