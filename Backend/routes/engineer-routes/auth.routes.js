const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  sendOTP,
  register,
  login,
  logout,
  refreshToken,
  verifyLogin
} = require('../../controllers/engineerControllers/engineerAuthController');
const { registerCompany } = require('../../controllers/companyControllers/companyAuthController');
const { authenticate } = require('../../middleware/authMiddleware');
const { isEngineer } = require('../../middleware/roleMiddleware');
const { getRegistrationConfig } = require('../../controllers/engineerControllers/engineerConfigController');

// Validation rules
const sendOTPValidation = [
  body('phone').trim().notEmpty().withMessage('Phone number is required').isLength({ min: 10, max: 10 }).withMessage('Phone number must be 10 digits'),
  body('email').optional({ nullable: true, checkFalsy: true }).isEmail().withMessage('Please provide a valid email')
];

const verifyLoginValidation = [
  body('phone').trim().notEmpty().withMessage('Phone number is required').isLength({ min: 10, max: 10 }).withMessage('Phone number must be 10 digits'),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
];

const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('phone').trim().notEmpty().withMessage('Phone number is required').isLength({ min: 10, max: 10 }).withMessage('Phone number must be 10 digits'),
  body('email').optional({ nullable: true, checkFalsy: true }).isEmail().withMessage('Please provide a valid email'),
  body('password').trim().notEmpty().withMessage('Password is required').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

const loginValidation = [
  body('phone').trim().notEmpty().withMessage('Phone number is required').isLength({ min: 10, max: 10 }).withMessage('Phone number must be 10 digits'),
  body('password').trim().notEmpty().withMessage('Password is required')
];

// Routes
router.post('/send-otp', sendOTPValidation, sendOTP);
router.post('/verify-login', verifyLoginValidation, verifyLogin); // New Unified Entry
router.post('/register', registerValidation, register);
router.post('/register-company', registerCompany);
router.post('/login', loginValidation, login);
router.post('/refresh-token', refreshToken);
router.get('/config/registration', getRegistrationConfig); // Added config route
router.post('/logout', authenticate, isEngineer, logout);

module.exports = router;
