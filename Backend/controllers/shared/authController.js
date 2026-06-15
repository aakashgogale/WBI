const mongoose = require('mongoose');
const admin = require('firebase-admin');
require('../../services/firebaseAdmin');

const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const PasswordResetToken = require('../../models/PasswordResetToken');
const AuthActivityLog = require('../../models/AuthActivityLog');
const User = require('../../models/User');
const Worker = require('../../models/Worker');
const Engineer = require('../../models/Engineer');
const Vendor = require('../../models/Vendor');
const Admin = require('../../models/Admin');
const Token = require('../../models/Token'); // Assuming tokens might be stored here for refresh invalidation

const ROLE_MODELS = {
  user: { model: User, name: 'User' },
  worker: { model: Worker, name: 'Worker' },
  engineer: { model: Engineer, name: 'Engineer' },
  vendor: { model: Vendor, name: 'Vendor' },
  admin: { model: Admin, name: 'Admin' }
};

const { generateTokenPair } = require('../../utils/tokenService');

// Helper to log auth activities
const logAuthActivity = async (data) => {
  try {
    await AuthActivityLog.create(data);
  } catch (error) {
    console.error('Failed to log auth activity:', error);
  }
};

// Helper to generate a 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// --- Mock Delivery Service ---
const sendOTP = async (identifier, otp, role) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[DEVELOPMENT ONLY] Mock Delivery: Sending OTP ${otp} to ${identifier} (Role: ${role})`);
  }
  // TODO: Plug in Nodemailer/Twilio/MSG91 later based on if identifier is email or mobile
  return true;
};

exports.forgotPassword = async (req, res) => {
  try {
    const { role, identifier } = req.body; // identifier can be email or mobile

    if (!role || !identifier) {
      return res.status(400).json({ success: false, message: 'Role and identifier are required' });
    }

    const roleConfig = ROLE_MODELS[role.toLowerCase()];
    if (!roleConfig) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    // Rate Limiting Check
    const recentRequests = await AuthActivityLog.countDocuments({
      identifier,
      action: 'FORGOT_PASSWORD_REQUEST',
      createdAt: { $gt: new Date(Date.now() - 15 * 60 * 1000) } // 15 mins
    });

    if (recentRequests >= 3) {
      await logAuthActivity({ role, roleModel: roleConfig.name, action: 'ACCOUNT_LOCKED', identifier, status: 'FAILURE', details: 'Rate limit exceeded', ipAddress: req.ip });
      return res.status(429).json({ success: false, message: 'Too many requests. Please try again later.' });
    }

    // Determine query: email or mobile
    const isEmail = identifier.includes('@');
    const query = isEmail ? { email: identifier } : { mobile: identifier };

    // Don't leak user existence logic starts here. We always succeed, even if user isn't found.
    const user = await roleConfig.model.findOne(query);

    if (user) {
      // Generate OTP and hash it
      const otp = generateOTP();
      const salt = await bcrypt.genSalt(10);
      const hashedOtp = await bcrypt.hash(otp, salt);

      // Save token, expires in 5 minutes
      await PasswordResetToken.findOneAndDelete({ userId: user._id, role }); // Remove any existing token

      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins
      await PasswordResetToken.create({
        userId: user._id,
        role,
        roleModel: roleConfig.name,
        hashedOtp,
        expiresAt
      });

      // Send OTP
      await sendOTP(identifier, otp, role);
      await logAuthActivity({ userId: user._id, role, roleModel: roleConfig.name, action: 'FORGOT_PASSWORD_REQUEST', identifier, status: 'SUCCESS', ipAddress: req.ip });
    } else {
      // User not found, log failure but don't tell the client
      await logAuthActivity({ role, action: 'FORGOT_PASSWORD_REQUEST', identifier, status: 'FAILURE', details: 'User not found', ipAddress: req.ip });
    }

    // Generic success response
    res.status(200).json({
      success: true,
      message: 'If an account with that identifier exists, an OTP has been sent.'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ success: false, message: 'Server error during forgot password' });
  }
};

exports.verifyResetOtp = async (req, res) => {
  try {
    const { role, identifier, otp } = req.body;

    if (!role || !identifier || !otp) {
      return res.status(400).json({ success: false, message: 'Role, identifier, and OTP are required' });
    }

    const roleConfig = ROLE_MODELS[role.toLowerCase()];
    if (!roleConfig) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    const isEmail = identifier.includes('@');
    const query = isEmail ? { email: identifier } : { mobile: identifier };
    const user = await roleConfig.model.findOne(query);

    if (!user) {
      await logAuthActivity({ role, action: 'OTP_FAILED', identifier, status: 'FAILURE', details: 'User not found during OTP verification', ipAddress: req.ip });
      return res.status(400).json({ success: false, message: 'Invalid OTP or expired' });
    }

    const resetRecord = await PasswordResetToken.findOne({ userId: user._id, role });

    if (!resetRecord) {
      await logAuthActivity({ userId: user._id, role, roleModel: roleConfig.name, action: 'OTP_FAILED', identifier, status: 'FAILURE', details: 'No active OTP found', ipAddress: req.ip });
      return res.status(400).json({ success: false, message: 'Invalid OTP or expired' });
    }

    if (resetRecord.expiresAt < new Date()) {
      await PasswordResetToken.deleteOne({ _id: resetRecord._id });
      return res.status(400).json({ success: false, message: 'OTP has expired' });
    }

    if (resetRecord.attempts >= 5) {
      await PasswordResetToken.deleteOne({ _id: resetRecord._id });
      await logAuthActivity({ userId: user._id, role, roleModel: roleConfig.name, action: 'ACCOUNT_LOCKED', identifier, status: 'FAILURE', details: 'Max OTP attempts reached', ipAddress: req.ip });
      return res.status(429).json({ success: false, message: 'Maximum attempts reached. Please request a new OTP.' });
    }

    const isMatch = await bcrypt.compare(otp, resetRecord.hashedOtp);

    if (!isMatch) {
      resetRecord.attempts += 1;
      await resetRecord.save();
      await logAuthActivity({ userId: user._id, role, roleModel: roleConfig.name, action: 'OTP_FAILED', identifier, status: 'FAILURE', details: `Attempt ${resetRecord.attempts}`, ipAddress: req.ip });
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    // OTP Verified! Generate a secure resetToken (valid for 15 mins)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    resetRecord.resetToken = hashedResetToken;
    resetRecord.expiresAt = new Date(Date.now() + 15 * 60 * 1000); // Extended for password reset
    await resetRecord.save();

    await logAuthActivity({ userId: user._id, role, roleModel: roleConfig.name, action: 'OTP_VERIFIED', identifier, status: 'SUCCESS', ipAddress: req.ip });

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
      resetToken // Return raw token to frontend to be used in reset step
    });

  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ success: false, message: 'Server error during OTP verification' });
  }
};

exports.resendResetOtp = async (req, res) => {
  try {
    const { role, identifier } = req.body;

    if (!role || !identifier) {
      return res.status(400).json({ success: false, message: 'Role and identifier are required' });
    }

    const roleConfig = ROLE_MODELS[role.toLowerCase()];
    if (!roleConfig) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    const isEmail = identifier.includes('@');
    const query = isEmail ? { email: identifier } : { mobile: identifier };
    const user = await roleConfig.model.findOne(query);

    if (!user) {
      return res.status(200).json({ success: true, message: 'If an account exists, a new OTP has been sent.' });
    }

    let resetRecord = await PasswordResetToken.findOne({ userId: user._id, role });

    // Cooldown check
    if (resetRecord && resetRecord.lastResendAt) {
      const cooldownMs = 60 * 1000; // 1 minute cooldown
      if (Date.now() - resetRecord.lastResendAt.getTime() < cooldownMs) {
        return res.status(429).json({ success: false, message: 'Please wait before requesting a new OTP' });
      }
    }

    const otp = generateOTP();
    const salt = await bcrypt.genSalt(10);
    const hashedOtp = await bcrypt.hash(otp, salt);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

    if (resetRecord) {
      resetRecord.hashedOtp = hashedOtp;
      resetRecord.expiresAt = expiresAt;
      resetRecord.lastResendAt = Date.now();
      resetRecord.attempts = 0; // Reset attempts
      await resetRecord.save();
    } else {
      await PasswordResetToken.create({
        userId: user._id,
        role,
        roleModel: roleConfig.name,
        hashedOtp,
        expiresAt,
        lastResendAt: Date.now()
      });
    }

    await sendOTP(identifier, otp, role);
    await logAuthActivity({ userId: user._id, role, roleModel: roleConfig.name, action: 'FORGOT_PASSWORD_REQUEST', identifier, status: 'SUCCESS', details: 'Resend', ipAddress: req.ip });

    res.status(200).json({ success: true, message: 'If an account exists, a new OTP has been sent.' });

  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ success: false, message: 'Server error during OTP resend' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { role, identifier, resetToken, newPassword, confirmPassword } = req.body;

    if (!role || !identifier || !resetToken || !newPassword || !confirmPassword) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long' });
    }

    const roleConfig = ROLE_MODELS[role.toLowerCase()];
    if (!roleConfig) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    const isEmail = identifier.includes('@');
    const query = isEmail ? { email: identifier } : { mobile: identifier };
    const user = await roleConfig.model.findOne(query);

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid request' });
    }

    const resetRecord = await PasswordResetToken.findOne({ userId: user._id, role });

    if (!resetRecord || !resetRecord.resetToken) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    }

    const hashedResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    if (hashedResetToken !== resetRecord.resetToken) {
      return res.status(400).json({ success: false, message: 'Invalid reset token' });
    }

    if (resetRecord.expiresAt < new Date()) {
      await PasswordResetToken.deleteOne({ _id: resetRecord._id });
      return res.status(400).json({ success: false, message: 'Reset token has expired' });
    }

    // Hash the new password and update user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    user.password = hashedPassword;
    await user.save();

    // Clean up reset token
    await PasswordResetToken.deleteOne({ _id: resetRecord._id });

    // Invalidate old refresh tokens (if your system uses a Token model for refresh tokens)
    try {
      if (mongoose.models.Token) {
        await mongoose.models.Token.deleteMany({ user: user._id }); // Assuming Token model uses 'user' field
      }
    } catch(e) {
      // Ignore if Token model isn't set up
    }

    await logAuthActivity({ userId: user._id, role, roleModel: roleConfig.name, action: 'PASSWORD_RESET', identifier, status: 'SUCCESS', ipAddress: req.ip });

    res.status(200).json({
      success: true,
      message: 'Password reset successfully. You can now login.'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, message: 'Server error during password reset' });
  }
};

exports.unifiedLogin = async (req, res) => {
  try {
    const mobileOrPhone = req.body.mobile || req.body.phone;
    const password = req.body.password;

    if (!mobileOrPhone || !password) {
      return res.status(400).json({ success: false, message: 'Mobile/Phone and password are required' });
    }

    // Determine if input is email or mobile
    const isEmail = mobileOrPhone.includes('@');
    const query = isEmail ? { email: mobileOrPhone } : { phone: mobileOrPhone };
    
    // Admin uses 'email' field always, while others use 'phone' or 'email'. 
    // If it is NOT an email, Admin might not be found. 
    // We will search across collections sequentially.

    const collectionsToSearch = [
      { role: 'worker', model: Worker, redirect: '/worker/dashboard' },
      { role: 'engineer', model: Engineer, redirect: '/engineer/dashboard' },
      { role: 'vendor', model: Vendor, redirect: '/vendor/dashboard' },
      { role: 'user', model: User, redirect: '/user/dashboard' },
      { role: 'admin', model: Admin, redirect: '/admin/dashboard', queryOverride: isEmail ? { email: mobile } : { email: mobile } } 
    ];

    let foundUser = null;
    let foundRoleInfo = null;

    for (const item of collectionsToSearch) {
      const searchQuery = item.queryOverride || query;
      // Exclude password field unless we need it. Wait, we DO need it.
      const user = await item.model.findOne(searchQuery).select('+password');
      if (user) {
        foundUser = user;
        foundRoleInfo = item;
        // If the user's role field overrides the default role (e.g. User model can have 'admin' role)
        if (user.role && user.role === 'admin' && item.role === 'user') {
          foundRoleInfo.role = 'admin';
          foundRoleInfo.redirect = '/admin/dashboard';
        }
        break; // Stop searching once found
      }
    }

    if (!foundUser) {
      return res.status(404).json({ success: false, message: 'Account not found with this mobile/email' });
    }

    // Verify Password
    const isMatch = await foundUser.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check if Active
    if (foundUser.isActive === false) {
      return res.status(403).json({ success: false, message: 'Account is deactivated' });
    }

    // Update login session
    const loginSessionId = Date.now().toString();
    const updateQuery = { 
      loginSessionId,
      $set: { fcmTokens: [], fcmTokenMobile: [] }
    };
    // Update lastLogin for Admin
    if (foundRoleInfo.role === 'admin') {
      updateQuery.lastLogin = new Date();
    }
    
    // Try to update, but some models might not have fcmTokens so we do it safely
    await foundRoleInfo.model.findByIdAndUpdate(foundUser._id, updateQuery).catch(() => {
       // fallback if fcmTokens doesn't exist on schema
       return foundRoleInfo.model.findByIdAndUpdate(foundUser._id, { loginSessionId });
    });

    // Generate Token
    const tokens = generateTokenPair({
      userId: foundUser._id,
      role: foundRoleInfo.role,
      loginSessionId
    });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: foundUser._id,
        name: foundUser.name,
        mobile: foundUser.phone || foundUser.mobile || null,
        email: foundUser.email,
        role: foundRoleInfo.role,
        status: foundUser.status || foundUser.approvalStatus || undefined
      },
      redirectTo: foundRoleInfo.redirect
    });

  } catch (error) {
    console.error('Unified login error:', error);
    res.status(500).json({ success: false, message: 'Login failed due to server error' });
  }
};

exports.socialLogin = async (req, res) => {
  try {
    const { token, role } = req.body;
    if (!token || !role) {
      return res.status(400).json({ success: false, message: 'Token and role are required' });
    }

    // Verify Firebase token
    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(token);
    } catch (err) {
      console.error('Firebase token verification failed:', err);
      return res.status(401).json({ success: false, message: 'Invalid or expired authentication token' });
    }

    const { email, name, uid, firebase_sign_in_provider } = decodedToken;
    const providerId = uid;
    
    // Determine target model
    const collectionsToSearch = [
      { role: 'worker', model: Worker, redirect: '/worker/dashboard' },
      { role: 'engineer', model: Engineer, redirect: '/engineer/dashboard' },
      { role: 'vendor', model: Vendor, redirect: '/vendor/dashboard' },
      { role: 'user', model: User, redirect: '/user' },
      { role: 'admin', model: Admin, redirect: '/admin/dashboard' }
    ];

    let targetRoleInfo = collectionsToSearch.find(c => c.role === role.toLowerCase());
    
    if (!targetRoleInfo && role.toLowerCase() === 'all') {
      for (const item of collectionsToSearch) {
         let existing = await item.model.findOne({ $or: [{ email }, { googleId: providerId }, { appleId: providerId }] });
         if (existing) {
             targetRoleInfo = item;
             break;
         }
      }
    }
    
    if (!targetRoleInfo && role.toLowerCase() !== 'all') {
        targetRoleInfo = collectionsToSearch[0]; // fallback
    }

    if (!targetRoleInfo) {
      return res.status(404).json({ success: false, message: 'Account not found across any role' });
    }

    const Model = targetRoleInfo.model;

    // Check if user exists
    let user = await Model.findOne({
      $or: [
        { email },
        { googleId: providerId },
        { appleId: providerId }
      ]
    });

    let isNewUser = false;
    if (!user) {
      const newUserData = {
        name: name || 'User',
        email,
        isActive: true,
        isEmailVerified: true
      };
      
      if (firebase_sign_in_provider === 'google.com') {
        newUserData.googleId = providerId;
      } else if (firebase_sign_in_provider === 'apple.com') {
        newUserData.appleId = providerId;
      }

      user = new Model(newUserData);
      await user.save();
      isNewUser = true;
    } else {
      if (firebase_sign_in_provider === 'google.com' && !user.googleId) {
        user.googleId = providerId;
        await user.save();
      } else if (firebase_sign_in_provider === 'apple.com' && !user.appleId) {
        user.appleId = providerId;
        await user.save();
      }
    }

    if (user.isActive === false) {
      return res.status(403).json({ success: false, message: 'Account is deactivated' });
    }

    const loginSessionId = Date.now().toString();
    const updateQuery = { 
      loginSessionId,
      $set: { fcmTokens: [], fcmTokenMobile: [] }
    };
    if (targetRoleInfo.role === 'admin') {
      updateQuery.lastLogin = new Date();
    }
    
    await Model.findByIdAndUpdate(user._id, updateQuery).catch(() => {
       return Model.findByIdAndUpdate(user._id, { loginSessionId });
    });

    const tokens = generateTokenPair({
      userId: user._id,
      role: targetRoleInfo.role,
      loginSessionId
    });

    res.status(200).json({
      success: true,
      message: 'Social Login successful',
      isNewUser,
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user._id,
        name: user.name,
        mobile: user.phone || user.mobile || null,
        email: user.email,
        role: targetRoleInfo.role,
        status: user.status || user.approvalStatus || undefined
      },
      redirectTo: targetRoleInfo.redirect
    });

  } catch (error) {
    console.error('Social login error:', error);
    res.status(500).json({ success: false, message: 'Social login failed' });
  }
};
