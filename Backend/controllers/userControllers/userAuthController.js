const User = require('../../models/User');
const { findUserAcrossCollections } = require('../../utils/authHelper');
const { generateTokenPair, verifyRefreshToken, generateVerificationToken, verifyVerificationToken } = require('../../utils/tokenService');
const { generateOTP, hashOTP, storeOTP, verifyOTP, checkRateLimit } = require('../../utils/redisOtp.util');
const { sendOTP: sendSMSOTP } = require('../../services/smsService');
const { sendOTPEmail, sendWelcomeEmail } = require('../../services/emailService');
const { USER_ROLES } = require('../../utils/constants');
const { validationResult } = require('express-validator');

/**
 * Send OTP for user registration/login
 */
const sendOTP = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { phone, email } = req.body;

    // 1. Rate limit check
    const allowed = await checkRateLimit(phone);
    if (!allowed) {
      return res.status(429).json({
        success: false,
        message: 'Too many OTP requests. Please try again after 10 minutes.'
      });
    }

    // 2. Generate OTP
    const otp = generateOTP();
    const otpHash = hashOTP(otp);

    // 3. Store OTP (Redis primary, MongoDB fallback)
    await storeOTP(phone, otpHash);

    // 4. Send OTP via SMS (Fire and forget for faster API response)
    sendSMSOTP(phone, otp).then(smsResult => {
      if (!smsResult.success) {
        console.warn(`[OTP] SMS failed for ${phone}, but OTP stored`);
      }
    }).catch(err => console.error(`[OTP] SMS error for ${phone}:`, err));

    // Log OTP in development mode only (NEVER in production)
    if (process.env.NODE_ENV === 'development' || process.env.USE_DEFAULT_OTP === 'true') {
      console.log(`[DEV] OTP for ${phone}: ${otp}`);
    }

    // 5. Optional: Send email notification if email provided
    if (email) {
      sendOTPEmail(email, otp, 'verification').catch(err => 
        console.error(`[OTP] Email error for ${email}:`, err)
      );
    }

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
      token: 'verification-pending' // Required by frontend to allow login
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send OTP. Please try again.'
    });
  }
};

/**
 * Verify OTP and Check User Status (Unified Login/Signup Entry)
 */
const verifyLogin = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    // 1. Verify OTP
    const verification = await verifyOTP(phone, otp);
    if (!verification.success) {
      return res.status(400).json({
        success: false,
        message: verification.message
      });
    }

    // 2. Check if user exists in ANY collection, prioritizing 'user'
    const searchResult = await findUserAcrossCollections(phone, 'user');

    if (searchResult) {
      const { user: foundUser, role: resolvedRole, redirect: resolvedRedirect, model: matchedModel } = searchResult;

      // If they don't have a USER profile (they matched a different collection), 
      // treat them as a NEW user for the User app so they can create a User profile!
      if (resolvedRole !== 'user') {
        const verificationToken = generateVerificationToken(phone);
        return res.status(200).json({
          success: true,
          isNewUser: true,
          message: 'OTP verified. Please complete user registration.',
          verificationToken
        });
      }

      // EXISTING USER -> LOGIN
      if (foundUser.isActive === false) {
        return res.status(403).json({
          success: false,
          message: 'Your account has been deactivated.'
        });
      }

      // SINGLE DEVICE LOGIN: Update Session ID & Clear OLD FCM tokens
      const loginSessionId = Date.now().toString();
      await matchedModel.findByIdAndUpdate(foundUser._id, { 
        loginSessionId,
        $set: { fcmTokens: [], fcmTokenMobile: [] } // Clear all old tokens
      }).catch(() => {}); // Safely ignore if fields don't exist
      
      const tokens = generateTokenPair({
        userId: foundUser._id.toString(),
        role: resolvedRole.toUpperCase(),
        profileId: foundUser._id.toString(),
        mobile: foundUser.phone || foundUser.mobile || null,
        email: foundUser.email || null,
        loginSessionId
      });

      const userRes = foundUser.toObject();
      delete userRes.password;
      delete userRes.__v;
      userRes.id = foundUser._id;
      userRes.mobile = foundUser.phone || foundUser.mobile || null;
      userRes.role = resolvedRole;
      userRes.status = foundUser.status || foundUser.approvalStatus || undefined;

      return res.status(200).json({
        success: true,
        isNewUser: false,
        message: 'Login successful',
        token: tokens.accessToken,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: userRes,
        role: resolvedRole,
        profileId: foundUser._id.toString(),
        redirectTo: resolvedRedirect,
        platform: 'mobile'
      });

    } else {
      // NEW USER -> RETURN VERIFICATION TOKEN
      const verificationToken = generateVerificationToken(phone);

      return res.status(200).json({
        success: true,
        isNewUser: true,
        message: 'OTP verified. Please complete registration.',
        verificationToken
      });
    }

  } catch (error) {
    console.error('Verify Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Verification failed. Please try again.'
    });
  }
};

/**
 * Register user with Verification Token (No OTP required again)
 */
const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, email, verificationToken } = req.body;
    let phone = req.body.phone;

    // Verify token if provided (New Flow)
    if (verificationToken) {
      const verifiedPhone = verifyVerificationToken(verificationToken);
      if (!verifiedPhone) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired verification session. Please verify phone again.'
        });
      }
      phone = verifiedPhone; // Trust the token's phone number
    } else {
      // Fallback to legacy OTP flow (if needed, but discouraged)
      if (!req.body.otp) {
        return res.status(400).json({ success: false, message: 'Verification token or OTP required.' });
      }
      const verification = await verifyOTP(phone, req.body.otp);
      if (!verification.success) {
        return res.status(400).json({ success: false, message: verification.message });
      }
    }

    // Check if user already exists
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists. Please login.'
      });
    }

    // Create user
    const user = await User.create({
      name,
      email: email || null,
      phone,
      isPhoneVerified: true,
      isEmailVerified: email ? false : true
    });

    // Send Welcome Email
    if (email) {
      sendWelcomeEmail(email, name).catch(err => console.error(err));
    }

    // Generate JWT tokens with session
    const loginSessionId = Date.now().toString();
    await User.findByIdAndUpdate(user._id, { loginSessionId });

    const tokens = generateTokenPair({
      userId: user._id,
      role: USER_ROLES.USER,
      loginSessionId
    });

    const userRes = user.toObject();
    delete userRes.password;
    delete userRes.__v;
    userRes.id = user._id;

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      user: userRes,
      ...tokens
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again.'
    });
  }
};

/**
 * Login user with OTP
 */
const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { phone, otp } = req.body;

    // Verify OTP (checks Redis first, falls back to MongoDB)
    const verification = await verifyOTP(phone, otp);
    if (!verification.success) {
      return res.status(400).json({
        success: false,
        message: verification.message
      });
    }

    // Find user
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found. Please sign up first.'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.'
      });
    }

    // SINGLE DEVICE LOGIN: Update Session ID & Clear OLD FCM tokens
    const loginSessionId = Date.now().toString();
    await User.findByIdAndUpdate(user._id, { 
      loginSessionId,
      $set: { fcmTokens: [], fcmTokenMobile: [] } // Clear all old tokens
    });

    const tokens = generateTokenPair({
      userId: user._id,
      role: USER_ROLES.USER,
      loginSessionId
    });

    const userRes = user.toObject();
    delete userRes.password;
    delete userRes.__v;
    userRes.id = user._id;

    res.status(200).json({
      success: true,
      message: 'Login successful',
      user: userRes,
      platform: 'mobile',
      ...tokens
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again.'
    });
  }
};

/**
 * Logout user
 */
const logout = async (req, res) => {
  try {
    const { platform = 'web' } = req.body;

    // Clear FCM tokens based on platform and reset session
    if (req.user && req.user.id) {
      const updateQuery = platform === 'mobile'
        ? { $set: { fcmTokenMobile: [], loginSessionId: null } }
        : { $set: { fcmTokens: [], loginSessionId: null } };

      await User.findByIdAndUpdate(req.user.id, updateQuery);
      console.log(`[AUTH] ✅ ${platform} session & tokens cleared for user: ${req.user.id}`);
    }

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed'
    });
  }
};

/**
 * Refresh Access Token
 */
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required'
      });
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token'
      });
    }

    // Check if user exists
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check status
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is not active'
      });
    }

    // Verify Session ID
    if (decoded.loginSessionId !== user.loginSessionId) {
      return res.status(401).json({ success: false, message: 'LoggedIn on another device.' });
    }

    // Generate new token pair
    const tokens = generateTokenPair({
      userId: user._id,
      role: USER_ROLES.USER,
      loginSessionId: user.loginSessionId
    });

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      ...tokens
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to refresh token'
    });
  }
};

module.exports = {
  sendOTP,
  verifyLogin,
  register,
  login,
  logout,
  refreshToken
};
