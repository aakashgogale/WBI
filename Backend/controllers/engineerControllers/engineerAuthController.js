const Engineer = require('../../models/Engineer');
const { generateOTP, hashOTP, storeOTP, verifyOTP, checkRateLimit } = require('../../utils/redisOtp.util');
const { generateTokenPair, verifyRefreshToken, generateVerificationToken, verifyVerificationToken } = require('../../utils/tokenService');
const { sendOTP: sendSMSOTP } = require('../../services/smsService');
const cloudinaryService = require('../../services/cloudinaryService');
const { USER_ROLES, ENGINEER_STATUS } = require('../../utils/constants');
const { validationResult } = require('express-validator');
const Worker = require('../../models/Worker');

/**
 * Send OTP for engineer registration/login
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

    // 4. Send OTP via SMS
    const smsResult = await sendSMSOTP(phone, otp);

    // Log OTP
    if (process.env.NODE_ENV === 'development' || process.env.USE_DEFAULT_OTP === 'true') {
      console.log(`[DEV] Engineer OTP for ${phone}: ${otp}`);
    }

    if (!smsResult.success) {
      console.warn(`[OTP] SMS failed for engineer ${phone}, but OTP stored`);
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
 * Verify OTP and Check Engineer Status (Unified Login/Signup Entry)
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

    // 2. Check if engineer exists
    const engineer = await Engineer.findOne({ phone });

    if (engineer) {
      // EXISTING ENGINEER
      if (!engineer.isActive) {
        return res.status(403).json({ success: false, message: 'Account deactivated.' });
      }

      // SINGLE DEVICE LOGIN: Update Session ID & Clear OLD FCM tokens
      const loginSessionId = Date.now().toString();
      await Engineer.findByIdAndUpdate(engineer._id, { 
        loginSessionId,
        $set: { fcmTokens: [], fcmTokenMobile: [] } // Clear all old tokens
      });

      const tokens = generateTokenPair({
        userId: engineer._id,
        role: USER_ROLES.ENGINEER,
        loginSessionId
      });

      return res.status(200).json({
        success: true,
        isNewUser: false,
        message: 'Login successful',
        engineer: {
          id: engineer._id,
          name: engineer.name,
          email: engineer.email,
          phone: engineer.phone,
          status: engineer.status,
          status: engineer.status,
          serviceCategories: engineer.serviceCategories || []
        },
        ...tokens
      });

    } else {
      // NEW ENGINEER
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
 * Register engineer (Multi-Step payload)
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
      serviceCategories, subServices, skills,
      uploadedDocuments,
      skillCertificates,
      roleType, role,
      experience, qualification, specialization, city, pincode,
      ...customFields // Capture all other dynamic fields here
    } = req.body;

    const currentRole = (roleType || role || '').toLowerCase();
    if (currentRole !== 'engineer') {
      return res.status(400).json({
        success: false,
        message: 'Invalid role payload for engineer registration'
      });
    }

    // Check existing
    const existingEngineer = await Engineer.findOne({ $or: [{ phone }, { email }] });
    if (existingEngineer) {
      return res.status(400).json({
        success: false,
        message: 'Engineer already exists with this phone or email. Please login.'
      });
    }

    // Check Worker collection for same phone
    const existingWorker = await Worker.findOne({ phone });
    if (existingWorker) {
      return res.status(400).json({
        success: false,
        message: 'This mobile number is already registered as a Worker. Duplicate roles with the same number are not allowed.'
      });
    }

    // Process Documents to Cloudinary
    let processedDocuments = [];
    if (uploadedDocuments && Array.isArray(uploadedDocuments)) {
      for (let doc of uploadedDocuments) {
        let processedDoc = { key: doc.key, status: 'Pending' };
        
        if (doc.url && doc.url.startsWith('data:')) {
          const uploadRes = await cloudinaryService.uploadFile(doc.url, { folder: 'engineers/documents' });
          if (uploadRes.success) processedDoc.url = uploadRes.url;
        } else {
          processedDoc.url = doc.url;
        }

        if (doc.backUrl && doc.backUrl.startsWith('data:')) {
          const uploadResBack = await cloudinaryService.uploadFile(doc.backUrl, { folder: 'engineers/documents' });
          if (uploadResBack.success) processedDoc.backUrl = uploadResBack.url;
        } else {
          processedDoc.backUrl = doc.backUrl;
        }

        processedDocuments.push(processedDoc);
      }
    }

    // Process Skill Certificates Uploads
    let processedCertificates = [];
    if (skillCertificates && Array.isArray(skillCertificates)) {
      for (let cert of skillCertificates) {
        let processedCert = { ...cert };
        if (cert.documentUrl && cert.documentUrl.startsWith('data:')) {
          const uploadRes = await cloudinaryService.uploadFile(cert.documentUrl, { folder: 'engineers/certificates' });
          if (uploadRes.success) processedCert.documentUrl = uploadRes.url;
        }
        processedCertificates.push(processedCert);
      }
    }

    // Extract Aadhaar/PAN
    const aadhaarDoc = processedDocuments.find(d => d.key === 'aadhaar' || d.key === 'aadhar' || d.key === 'Aadhaar Card Front');
    const panDoc = processedDocuments.find(d => d.key === 'pan' || d.key === 'PAN Card Photo');

    // Create engineer
    const engineer = await Engineer.create({
      name, email, phone, password,
      serviceCategories: serviceCategories || [],
      subServices: subServices || [],
      skills: skills || [],
      uploadedDocuments: processedDocuments,
      roleType: 'Engineer',
      experience: experience || 0,
      qualification: qualification || '',
      specialization: specialization || '',
      address: {
        city: city || '',
        pincode: pincode || ''
      },
      customFields: customFields || {},
      
      // Documents fallback
      pan: {
        number: customFields?.panNumber || '',
        document: panDoc?.url || null
      },
      skillCertificates: processedCertificates,
      documents: {
        aadhaar: aadhaarDoc?.url || null,
        pan: panDoc?.url || null,
        status: 'Pending'
      },
      
      status: ENGINEER_STATUS.OFFLINE,
      approvalStatus: 'pending' // Admin needs to approve
    });

    // Generate JWT tokens with initial session
    const loginSessionId = Date.now().toString();
    await Engineer.findByIdAndUpdate(engineer._id, { loginSessionId });

    const tokens = generateTokenPair({
      userId: engineer._id,
      role: USER_ROLES.ENGINEER,
      loginSessionId
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful. Account pending approval.',
      engineer: {
        id: engineer._id,
        name: engineer.name,
        email: engineer.email,
        phone: engineer.phone,
        status: engineer.status,
        approvalStatus: engineer.approvalStatus
      },
      ...tokens
    });
  } catch (error) {
    console.error('Engineer registration error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Registration failed. Please try again.'
    });
  }
};

/**
 * Login engineer with Password
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

    const { phone, password } = req.body;

    // Find engineer
    const engineer = await Engineer.findOne({ phone }).select('+password');
    if (!engineer) {
      return res.status(404).json({
        success: false,
        message: 'Engineer not found. Please register first.'
      });
    }

    // Verify Password
    const isMatch = await engineer.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid phone or password'
      });
    }



    if (!engineer.isActive) {
      return res.status(403).json({ success: false, message: 'Account deactivated.' });
    }
    const loginSessionId = Date.now().toString();
    await Engineer.findByIdAndUpdate(engineer._id, { 
      loginSessionId,
      $set: { fcmTokens: [], fcmTokenMobile: [] } // Clear all old tokens
    });

    const tokens = generateTokenPair({
      userId: engineer._id,
      role: USER_ROLES.ENGINEER,
      loginSessionId
    });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      engineer: {
        id: engineer._id,
        name: engineer.name,
        email: engineer.email,
        phone: engineer.phone,
        status: engineer.status,
        serviceCategories: engineer.serviceCategories || []
      },
      ...tokens
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
 * Logout engineer
 */
const logout = async (req, res) => {
  try {
    const { platform = 'web' } = req.body;

    // Clear FCM tokens based on platform and reset Session ID
    if (req.user && req.user.id) {
      const updateQuery = platform === 'mobile'
        ? { $set: { fcmTokenMobile: [], loginSessionId: null } }
        : { $set: { fcmTokens: [], loginSessionId: null } };

      await Engineer.findByIdAndUpdate(req.user.id, updateQuery);
      console.log(`[AUTH] ✅ ${platform} session & tokens cleared for engineer: ${req.user.id}`);
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

    // Check if engineer exists
    const engineer = await Engineer.findById(decoded.userId);
    if (!engineer) {
      return res.status(404).json({
        success: false,
        message: 'Engineer not found'
      });
    }

    // Check status
    if (!engineer.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is not active'
      });
    }

    // Verify Session ID
    if (decoded.loginSessionId !== engineer.loginSessionId) {
      return res.status(401).json({ success: false, message: 'LoggedIn on another device.' });
    }

    // Generate new token pair
    const tokens = generateTokenPair({
      userId: engineer._id,
      role: USER_ROLES.ENGINEER,
      loginSessionId: engineer.loginSessionId
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
