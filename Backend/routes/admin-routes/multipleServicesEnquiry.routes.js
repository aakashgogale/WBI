const express = require('express');
const router = express.Router();
const multipleServicesEnquiryController = require('../../controllers/multipleServicesEnquiry.controller');
const { authenticate } = require('../../middleware/authMiddleware');
const { isAdmin } = require('../../middleware/roleMiddleware');

// Protect all routes and restrict to admin
router.use(authenticate);
router.use(isAdmin);

router.get('/', multipleServicesEnquiryController.getEnquiries);
router.get('/:id', multipleServicesEnquiryController.getEnquiry);
router.put('/:id/status', multipleServicesEnquiryController.updateStatus);
router.delete('/:id', multipleServicesEnquiryController.deleteEnquiry);

module.exports = router;
