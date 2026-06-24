const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const { uploadGenericFile, handleMulterError } = require('../middleware/uploadMiddleware');
const verificationController = require('../controllers/verificationController');

// Middleware to authorize both Workers and Engineers
const isWorkerOrEngineer = (req, res, next) => {
  const role = req.userRole?.toUpperCase();
  if (role === 'WORKER' || role === 'ENGINEER') {
    return next();
  }
  return res.status(403).json({ success: false, message: 'Access denied. Worker or Engineer role required.' });
};

const { verificationLimiter } = require('../middleware/rateLimiter');

// 1. Upload private verification document
router.post(
  '/upload',
  authenticate,
  isWorkerOrEngineer,
  uploadGenericFile,
  handleMulterError,
  verificationController.uploadDocument
);

// 2. Fetch overall verification request and documents status
router.get('/my-status', authenticate, isWorkerOrEngineer, verificationController.getMyStatus);

// 3. Finalize and submit documents for review
router.post('/submit', authenticate, isWorkerOrEngineer, verificationController.submitRequest);

// 4. CGPE Instant Verification Endpoints
router.post('/aadhaar/verify', authenticate, isWorkerOrEngineer, verificationLimiter, verificationController.verifyAadhaar);
router.post('/pan/verify', authenticate, isWorkerOrEngineer, verificationLimiter, verificationController.verifyPan);
router.post('/bank/verify', authenticate, isWorkerOrEngineer, verificationLimiter, verificationController.verifyBankDetails);
router.post('/selfie/verify', authenticate, isWorkerOrEngineer, verificationLimiter, verificationController.verifySelfieMatch);

module.exports = router;
