const express = require('express');
const router = express.Router();
const automatedPowerMonitoringEnquiryController = require('../../controllers/automatedPowerMonitoringEnquiry.controller');
const { authenticate } = require('../../middleware/authMiddleware');
const { isAdmin } = require('../../middleware/roleMiddleware');

// Protect all routes and restrict to admin
router.use(authenticate);
router.use(isAdmin);

router.get('/', automatedPowerMonitoringEnquiryController.getEnquiries);
router.get('/:id', automatedPowerMonitoringEnquiryController.getEnquiry);
router.put('/:id/status', automatedPowerMonitoringEnquiryController.updateStatus);
router.delete('/:id', automatedPowerMonitoringEnquiryController.deleteEnquiry);

module.exports = router;
