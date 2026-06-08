const express = require('express');
const router = express.Router();
const multipleServicesEnquiryController = require('../../controllers/multipleServicesEnquiry.controller');
const { protect, authorize } = require('../../middlewares/auth');

// Protect all routes and restrict to admin/super_admin
router.use(protect);
router.use(authorize('admin', 'super_admin'));

router.get('/', multipleServicesEnquiryController.getEnquiries);
router.get('/:id', multipleServicesEnquiryController.getEnquiry);
router.put('/:id/status', multipleServicesEnquiryController.updateStatus);
router.delete('/:id', multipleServicesEnquiryController.deleteEnquiry);

module.exports = router;
