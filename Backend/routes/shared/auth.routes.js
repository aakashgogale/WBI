const express = require('express');
const router = express.Router();
const authController = require('../../controllers/shared/authController');

router.post('/forgot-password', authController.forgotPassword);
router.post('/verify-reset-otp', authController.verifyResetOtp);
router.post('/resend-reset-otp', authController.resendResetOtp);
router.post('/reset-password', authController.resetPassword);

// Unified Login Endpoint
router.post('/login', authController.unifiedLogin);

// Social Login Endpoint
router.post('/social-login', authController.socialLogin);

module.exports = router;
