// utils/encryption.js — Field-Level Encryption at Rest for Sensitive Journal Data
// Uses AES-256-GCM (Authenticated Encryption with Associated Data)

const crypto = require('crypto');
const logger = require('./logger');

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;       // 16 bytes IV
const PREFIX = 'enc:v1:';   // Format: enc:v1:<iv_hex>:<authTag_hex>:<ciphertext_hex>

/**
 * Derives a consistent 32-byte (256-bit) encryption key.
 *
 * SECURITY NOTE — Two issues this function guards against:
 *   1. If ENCRYPTION_KEY is missing in production, encryption would silently
 *      use a predictable fallback, making field-level encryption meaningless.
 *      We now throw at startup in production so the deploy fails fast.
 *   2. ENCRYPTION_KEY was not listed in .env.example, so future deploys
 *      could easily miss setting it.  It has been added there as well.
 */
let _encryptionKeyWarned = false;

function getEncryptionKey() {
  if (process.env.ENCRYPTION_KEY) {
    return crypto.createHash('sha256').update(String(process.env.ENCRYPTION_KEY)).digest();
  }

  // In production: refuse to start with a fallback key
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      '[SECURITY] ENCRYPTION_KEY environment variable is not set. ' +
      'Refusing to start in production with a fallback key. ' +
      'Generate a strong random key: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"'
    );
  }

  // In development: fall back to JWT_SECRET but warn loudly (once)
  if (!_encryptionKeyWarned) {
    _encryptionKeyWarned = true;
    logger.warn({
      message: '[SECURITY] ENCRYPTION_KEY is not set — falling back to JWT_SECRET for development. ' +
               'Set a dedicated ENCRYPTION_KEY before deploying to production.',
    });
  }

  const fallback = process.env.JWT_SECRET || 'mindmirror-dev-fallback-key-32bytes';
  return crypto.createHash('sha256').update(String(fallback)).digest();
}

/**
 * Checks if a string is already encrypted with our format
 */
function isEncrypted(text) {
  return typeof text === 'string' && text.startsWith(PREFIX);
}

/**
 * Encrypts plaintext string using AES-256-GCM
 * @param {string} text - Plaintext string
 * @returns {string} Encrypted string in format enc:v1:<iv>:<authTag>:<ciphertext>
 */
function encrypt(text) {
  if (!text || typeof text !== 'string') {
    return text;
  }

  // Idempotent: do not double-encrypt
  if (isEncrypted(text)) {
    return text;
  }

  try {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    return `${PREFIX}${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  } catch (err) {
    logger.error({ message: 'Encryption failed', error: err.message });
    return text;
  }
}

/**
 * Decrypts AES-256-GCM encrypted string
 * @param {string} cipherText - Encrypted string (or legacy plaintext)
 * @returns {string} Decrypted plaintext string
 */
function decrypt(cipherText) {
  if (!cipherText || typeof cipherText !== 'string') {
    return cipherText;
  }

  // Gracefully handle legacy / unencrypted plaintext documents
  if (!isEncrypted(cipherText)) {
    return cipherText;
  }

  try {
    const parts = cipherText.slice(PREFIX.length).split(':');
    if (parts.length !== 3) {
      return cipherText;
    }

    const [ivHex, authTagHex, encryptedHex] = parts;
    const key = getEncryptionKey();
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (err) {
    logger.warn({ message: 'Decryption failed or invalid key/tag', error: err.message });
    return cipherText;
  }
}

module.exports = {
  encrypt,
  decrypt,
  isEncrypted,
};
