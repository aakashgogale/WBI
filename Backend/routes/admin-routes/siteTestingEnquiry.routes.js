const express = require('express');
const router = express.Router();
const siteTestingEnquiryController = require('../../controllers/siteTestingEnquiry.controller');
const { authenticate } = require('../../middleware/authMiddleware');
const { isAdmin } = require('../../middleware/roleMiddleware');

// Protect all routes and restrict to admin
router.use(authenticate);
router.use(isAdmin);

router.get('/', siteTestingEnquiryController.getEnquiries);
router.get('/:id', siteTestingEnquiryController.getEnquiry);
router.put('/:id/status', siteTestingEnquiryController.updateStatus);
router.delete('/:id', siteTestingEnquiryController.deleteEnquiry);

module.exports = router;
