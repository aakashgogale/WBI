const express = require('express');
const router = express.Router();
const siteTestingEnquiryController = require('../../controllers/siteTestingEnquiry.controller');
const { protect, authorize } = require('../../middlewares/auth');

// Protect all routes and restrict to admin/super_admin
router.use(protect);
router.use(authorize('admin', 'super_admin'));

router.get('/', siteTestingEnquiryController.getEnquiries);
router.get('/:id', siteTestingEnquiryController.getEnquiry);
router.put('/:id/status', siteTestingEnquiryController.updateStatus);
router.delete('/:id', siteTestingEnquiryController.deleteEnquiry);

module.exports = router;
