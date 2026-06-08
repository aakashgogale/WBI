const express = require('express');
const router = express.Router();
const automatedPowerMonitoringEnquiryController = require('../../controllers/automatedPowerMonitoringEnquiry.controller');
const { protect, authorize } = require('../../middlewares/auth');

// Protect all routes and restrict to admin/super_admin
router.use(protect);
router.use(authorize('admin', 'super_admin'));

router.get('/', automatedPowerMonitoringEnquiryController.getEnquiries);
router.get('/:id', automatedPowerMonitoringEnquiryController.getEnquiry);
router.put('/:id/status', automatedPowerMonitoringEnquiryController.updateStatus);
router.delete('/:id', automatedPowerMonitoringEnquiryController.deleteEnquiry);

module.exports = router;
