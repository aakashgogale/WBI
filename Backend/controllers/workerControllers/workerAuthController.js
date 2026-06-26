const Worker = require('../../models/Worker');
const { findUserAcrossCollections } = require('../../utils/authHelper');
const { generateOTP, hashOTP, storeOTP, verifyOTP, checkRateLimit } = require('../../utils/redisOtp.util');
const { generateTokenPair, verifyRefreshToken, generateVerificationToken, verifyVerificationToken } = require('../../utils/tokenService');
const { sendOTP: sendSMSOTP } = require('../../services/smsService');
const cloudinaryService = require('../../services/cloudinaryService');
const { USER_ROLES, WORKER_STATUS } = require('../../utils/constants');
const { validationResult } = require('express-validator');
const Engineer = require('../../models/Engineer');

/**
 * Send OTP for worker registration/login
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

    // 4. Send OTP via SMS (Fire and forget)
    sendSMSOTP(phone, otp).then(smsResult => {
      if (!smsResult.success) {
        console.warn(`[OTP] SMS failed for worker ${phone}, but OTP stored`);
      }
    }).catch(err => console.error(`[OTP] SMS error for ${phone}:`, err));

    // Log OTP
    if (process.env.NODE_ENV === 'development' || process.env.USE_DEFAULT_OTP === 'true') {
      console.log(`[DEV] Worker OTP for ${phone}: ${otp}`);
    }

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
      token: 'verification-pending'
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
 * Verify OTP and Check Worker Status (Unified Login/Signup Entry)
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

    // 2. Check if user exists dynamically in database
    const searchResult = await findUserAcrossCollections(phone, 'worker');

    if (searchResult) {
      const { user: foundUser, role: resolvedRole, redirect: resolvedRedirect, model: matchedModel } = searchResult;

      if (!foundUser.isActive && resolvedRole !== 'admin') {
        return res.status(403).json({ success: false, message: 'Account deactivated.' });
      }

      // Check vendor specific approval status
      if (resolvedRole === 'vendor') {
        const status = foundUser.approvalStatus || 'pending';
        if (status === 'pending') {
          return res.status(200).json({
            success: true,
            message: 'Your account is currently under review. Please wait for admin approval.',
            vendor: { adminApproval: 'pending' }
          });
        }
        if (status === 'rejected') {
          return res.status(403).json({ success: false, message: 'Account rejected.' });
        }
        if (status === 'suspended') {
          return res.status(403).json({ success: false, message: 'Account suspended.' });
        }
      }

      // SINGLE DEVICE LOGIN: Update Session ID & Clear OLD FCM tokens
      const loginSessionId = Date.now().toString();
      await matchedModel.findByIdAndUpdate(foundUser._id, { 
        loginSessionId,
        $set: { fcmTokens: [], fcmTokenMobile: [] } // Clear all old tokens
      });

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
        worker: resolvedRole === 'worker' ? userRes : undefined,
        role: resolvedRole,
        profileId: foundUser._id.toString(),
        redirectTo: resolvedRedirect,
        platform: 'mobile'
      });

    } else {
      // NEW WORKER
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
 * Register worker (Multi-Step payload)
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

    const { 
      name, email, phone, password,
      serviceCategories, subServices, skills, secondarySkills,
      uploadedDocuments,
      roleType, role,
      ...customFields // Capture all other dynamic fields here
    } = req.body;

    const currentRole = (roleType || role || '').toLowerCase();
    if (currentRole !== 'worker') {
      return res.status(400).json({
        success: false,
        message: 'Invalid role payload for worker registration'
      });
    }

    // Check existing
    let orConditions = [{ phone }];
    if (email && email.trim() !== '') {
      orConditions.push({ email });
    }
    const existingWorker = await Worker.findOne({ $or: orConditions });
    
    if (existingWorker) {
      return res.status(400).json({
        success: false,
        message: 'Worker already exists with this phone or email. Please login.'
      });
    }

    // Check Engineer collection for same phone
    const existingEngineer = await Engineer.findOne({ phone });
    if (existingEngineer) {
      return res.status(400).json({
        success: false,
        message: 'This mobile number is already registered as an Engineer. Duplicate roles with the same number are not allowed.'
      });
    }

    // Process Documents to Cloudinary
    let processedDocuments = [];
    if (uploadedDocuments && Array.isArray(uploadedDocuments)) {
      for (let doc of uploadedDocuments) {
        let processedDoc = { key: doc.key, status: 'Pending' };
        
        if (doc.url && doc.url.startsWith('data:')) {
          const uploadRes = await cloudinaryService.uploadFile(doc.url, { folder: 'workers/documents' });
          if (uploadRes.success) processedDoc.url = uploadRes.url;
        } else {
          processedDoc.url = doc.url;
        }

        if (doc.backUrl && doc.backUrl.startsWith('data:')) {
          const uploadResBack = await cloudinaryService.uploadFile(doc.backUrl, { folder: 'workers/documents' });
          if (uploadResBack.success) processedDoc.backUrl = uploadResBack.url;
        } else {
          processedDoc.backUrl = doc.backUrl;
        }

        processedDocuments.push(processedDoc);
      }
    }

    // Extract Aadhaar/PAN for backwards compatibility
    const aadhaarDoc = processedDocuments.find(d => d.key === 'aadhaar' || d.key === 'aadhar');
    const panDoc = processedDocuments.find(d => d.key === 'pan');

    // Create worker
    const worker = await Worker.create({
      name, email: email && email.trim() !== '' ? email : undefined, phone, password,
      serviceCategories: serviceCategories || [],
      subServices: subServices || [],
      skills: skills || [],
      secondarySkills: secondarySkills || [],
      uploadedDocuments: processedDocuments,
      roleType: 'Worker',
      customFields: customFields || {},
      documents: {
        aadhaar: aadhaarDoc?.url || null,
        pan: panDoc?.url || null,
        status: 'Pending'
      },
      status: WORKER_STATUS.OFFLINE,
      approvalStatus: 'pending' // Admin needs to approve
    });

    // Generate JWT tokens with initial session
    const loginSessionId = Date.now().toString();
    await Worker.findByIdAndUpdate(worker._id, { loginSessionId });

    const tokens = generateTokenPair({
      userId: worker._id,
      role: USER_ROLES.WORKER,
      loginSessionId
    });

    const workerRes = worker.toObject();
    delete workerRes.password;
    delete workerRes.__v;
    workerRes.id = worker._id;

    res.status(201).json({
      success: true,
      message: 'Registration successful. Account pending approval.',
      worker: workerRes,
      ...tokens
    });
  } catch (error) {
    console.error('Worker registration error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Registration failed. Please try again.'
    });
  }
};

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

    const { phone, password } = req.body;

    // Dynamic role lookup from database
    const searchResult = await findUserAcrossCollections(phone);
    if (!searchResult) {
      return res.status(404).json({
        success: false,
        message: 'Account not found. Please register first.'
      });
    }

    const { user: foundUser, role: resolvedRole, redirect: resolvedRedirect, model: matchedModel } = searchResult;

    // Verify Password
    const isMatch = await foundUser.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid phone or password'
      });
    }

    if (!foundUser.isActive && resolvedRole !== 'admin') {
      return res.status(403).json({ success: false, message: 'Account deactivated.' });
    }

    // Check vendor specific approval status
    if (resolvedRole === 'vendor') {
      const status = foundUser.approvalStatus || 'pending';
      if (status === 'pending') {
        return res.status(403).json({
          success: false,
          message: 'Your account is pending admin approval. Please wait for approval.'
        });
      }
      if (status === 'rejected') {
        return res.status(403).json({
          success: false,
          message: 'Your account has been rejected. Please contact support.'
        });
      }
      if (status === 'suspended') {
        return res.status(403).json({
          success: false,
          message: 'Your account has been suspended. Please contact support.'
        });
      }
    }

    const loginSessionId = Date.now().toString();
    await matchedModel.findByIdAndUpdate(foundUser._id, { 
      loginSessionId,
      $set: { fcmTokens: [], fcmTokenMobile: [] } // Clear all old tokens
    });

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

    res.status(200).json({
      success: true,
      message: 'Login successful',
      role: resolvedRole,
      user: userRes,
      worker: resolvedRole === 'worker' ? userRes : undefined,
      engineer: resolvedRole === 'engineer' ? userRes : undefined,
      redirectTo: resolvedRedirect,
      token: tokens.accessToken,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      profileId: foundUser._id.toString(),
      platform: 'mobile'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
};

/**
 * Logout worker
 */
const logout = async (req, res) => {
  try {
    const { platform = 'web' } = req.body;

    // Clear FCM tokens based on platform and reset Session ID
    if (req.user && req.user.id) {
      const updateQuery = platform === 'mobile'
        ? { $set: { fcmTokenMobile: [], loginSessionId: null } }
        : { $set: { fcmTokens: [], loginSessionId: null } };

      await Worker.findByIdAndUpdate(req.user.id, updateQuery);
      console.log(`[AUTH] ✅ ${platform} session & tokens cleared for worker: ${req.user.id}`);
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

    // Check if worker exists
    const worker = await Worker.findById(decoded.userId);
    if (!worker) {
      return res.status(404).json({
        success: false,
        message: 'Worker not found'
      });
    }

    // Check status
    if (!worker.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is not active'
      });
    }

    // Verify Session ID
    if (decoded.loginSessionId !== worker.loginSessionId) {
      return res.status(401).json({ success: false, message: 'LoggedIn on another device.' });
    }

    // Generate new token pair
    const tokens = generateTokenPair({
      userId: worker._id,
      role: USER_ROLES.WORKER,
      loginSessionId: worker.loginSessionId
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
