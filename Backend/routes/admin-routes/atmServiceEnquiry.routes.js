const express = require('express');
const router = express.Router();
const atmServiceEnquiryController = require('../../controllers/atmServiceEnquiry.controller');
const { authenticate } = require('../../middleware/authMiddleware');
const { isAdmin } = require('../../middleware/roleMiddleware');

// Protect all routes and restrict to admin
router.use(authenticate);
router.use(isAdmin);

router.get('/', atmServiceEnquiryController.getEnquiries);
router.get('/:id', atmServiceEnquiryController.getEnquiry);
router.put('/:id/status', atmServiceEnquiryController.updateStatus);
router.delete('/:id', atmServiceEnquiryController.deleteEnquiry);

module.exports = router;
