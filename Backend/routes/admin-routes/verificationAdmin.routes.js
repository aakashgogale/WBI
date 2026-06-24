const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/authMiddleware');
const { isAdmin } = require('../../middleware/roleMiddleware');
const verificationAdminController = require('../../controllers/verificationAdminController');

// 1. List and detail verification requests
router.get('/verifications', authenticate, isAdmin, verificationAdminController.getVerifications);
router.get('/verifications/:id', authenticate, isAdmin, verificationAdminController.getVerificationDetail);

// 2. Approve/reject document triggers
router.patch('/verifications/:id/approve', authenticate, isAdmin, verificationAdminController.approveDocument);
router.patch('/verifications/:id/reject', authenticate, isAdmin, verificationAdminController.rejectDocument);
router.patch('/verifications/:id/request-reupload', authenticate, isAdmin, verificationAdminController.requestReupload);

// 3. Dynamic configurations for required documents list
router.get('/verification-config', authenticate, isAdmin, verificationAdminController.getVerificationConfig);
router.put('/verification-config', authenticate, isAdmin, verificationAdminController.updateVerificationConfig);

// 4. Audit logs for CGPE requests
router.get('/verification-logs', authenticate, isAdmin, verificationAdminController.getVerificationLogs);

module.exports = router;
