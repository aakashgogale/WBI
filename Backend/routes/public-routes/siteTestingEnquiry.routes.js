const express = require('express');
const router = express.Router();
const siteTestingEnquiryController = require('../../controllers/siteTestingEnquiry.controller');

// Create a new enquiry (Public)
router.post('/', siteTestingEnquiryController.createEnquiry);

module.exports = router;
