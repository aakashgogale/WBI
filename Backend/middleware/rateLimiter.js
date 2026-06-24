const rateLimit = require('express-rate-limit');

/**
 * Rate limiter middleware
 */
const rateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000, // 1 minute
  max: parseInt(process.env.RATE_LIMIT_MAX) || 300, // limit each IP to 300 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const verificationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // limit each IP to 15 verification requests per 15 minutes
  message: {
    success: false,
    message: 'Too many verification attempts from this device. Please try again in 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

rateLimiter.verificationLimiter = verificationLimiter;

module.exports = rateLimiter;

