const crypto = require('crypto');

// Get keys from environment or generate fallbacks (not recommended for production)
// In production, these MUST be set in .env
// ENCRYPTION_KEY must be exactly 32 bytes (64 hex characters)
// ENCRYPTION_IV must be exactly 16 bytes (32 hex characters)

const ALGORITHM = 'aes-256-cbc';

const getEncryptionConfig = () => {
  let key = process.env.ENCRYPTION_KEY;
  let iv = process.env.ENCRYPTION_IV;

  if (!key || key.length !== 64) {
    console.warn('⚠️ WARNING: ENCRYPTION_KEY is missing or invalid in .env! Using temporary volatile key.');
    key = crypto.randomBytes(32).toString('hex');
    process.env.ENCRYPTION_KEY = key;
  }

  if (!iv || iv.length !== 32) {
    console.warn('⚠️ WARNING: ENCRYPTION_IV is missing or invalid in .env! Using temporary volatile IV.');
    iv = crypto.randomBytes(16).toString('hex');
    process.env.ENCRYPTION_IV = iv;
  }

  return {
    key: Buffer.from(key, 'hex'),
    iv: Buffer.from(iv, 'hex')
  };
};

/**
 * Encrypts a plain text string
 * @param {string} text - The text to encrypt
 * @returns {string} - The encrypted string in hex format
 */
exports.encrypt = (text) => {
  if (!text) return text;
  try {
    const { key, iv } = getEncryptionConfig();
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  } catch (error) {
    console.error('Encryption failed:', error);
    throw new Error('Data encryption failed');
  }
};

/**
 * Decrypts an encrypted hex string
 * @param {string} encryptedText - The encrypted string in hex format
 * @returns {string} - The decrypted plain text
 */
exports.decrypt = (encryptedText) => {
  if (!encryptedText) return encryptedText;
  try {
    const { key, iv } = getEncryptionConfig();
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('Decryption failed:', error);
    // If decryption fails (e.g. key changed), return a fallback string rather than crashing the app
    return 'DECRYPTION_FAILED';
  }
};

/**
 * Masks an account number, showing only the last 4 digits
 * @param {string} accountNumber - The plain text account number
 * @returns {string} - The masked account number (e.g., XXXXXXXX1234)
 */
exports.maskAccountNumber = (accountNumber) => {
  if (!accountNumber || accountNumber === 'DECRYPTION_FAILED') return 'XXXX';
  if (accountNumber.length <= 4) return accountNumber;
  const last4 = accountNumber.slice(-4);
  const masked = 'X'.repeat(accountNumber.length - 4) + last4;
  return masked;
};
