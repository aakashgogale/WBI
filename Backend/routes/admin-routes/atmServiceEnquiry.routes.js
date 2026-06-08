const express = require('express');
const router = express.Router();
const atmServiceEnquiryController = require('../../controllers/atmServiceEnquiry.controller');
const { protect, authorize } = require('../../middlewares/auth');

// Protect all routes and restrict to admin/super_admin
router.use(protect);
router.use(authorize('admin', 'super_admin'));

router.get('/', atmServiceEnquiryController.getEnquiries);
router.get('/:id', atmServiceEnquiryController.getEnquiry);
router.put('/:id/status', atmServiceEnquiryController.updateStatus);
router.delete('/:id', atmServiceEnquiryController.deleteEnquiry);

module.exports = router;
