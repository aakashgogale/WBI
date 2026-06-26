const jwt = require('jsonwebtoken');

/**
 * Generate access token
 * @param {Object} payload - Token payload
 * @returns {string} - JWT token
 */
const generateAccessToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

/**
 * Generate refresh token
 * @param {Object} payload - Token payload
 * @returns {string} - JWT refresh token
 */
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d'
  });
};

/**
 * Generate token pair (access + refresh)
 * @param {Object} payload - Token payload
 * @returns {Object} - Token pair
 */
const generateTokenPair = (payload) => {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload)
  };
};

/**
 * Verify access token
 * @param {string} token - JWT token
 * @returns {Object} - Decoded token
 */
const verifyAccessToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

/**
 * Verify refresh token
 * @param {string} token - JWT refresh token
 * @returns {Object} - Decoded token
 */
const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  generateTokenPair,
  verifyAccessToken,
  verifyRefreshToken,

  /**
   * Generate temporary verification token for signup flow
   * @param {string} phone - Verified phone number
   * @returns {string} - JWT verification token
   */
  generateVerificationToken: (phone) => {
    return jwt.sign({ phone, type: 'verification' }, process.env.JWT_SECRET, {
      expiresIn: '60m'
    });
  },

  /**
   * Verify verification token
   * @param {string} token - JWT verification token
   * @returns {string|null} - Phone number if valid, null otherwise
   */
  verifyVerificationToken: (token) => {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Standard verification token
      if (decoded.type === 'verification' && decoded.phone) {
        return decoded.phone;
      }
      
      // Fallback: if frontend sent an access token instead (e.g., cross-role user didn't refresh page)
      if (decoded.mobile || decoded.phone) {
        return decoded.mobile || decoded.phone;
      }
      
      console.log('[JWT_DEBUG] verifyVerificationToken: Token decoded but no valid phone/mobile found:', decoded);
      require('fs').appendFileSync('jwt_debug.log', JSON.stringify({ time: new Date(), error: 'No phone found', decoded }) + '\\n');
      return null;
    } catch (error) {
      console.log('[JWT_DEBUG] verifyVerificationToken failed:', error.message);
      require('fs').appendFileSync('jwt_debug.log', JSON.stringify({ time: new Date(), error: error.message, token }) + '\\n');
      return null;
    }
  }
};

