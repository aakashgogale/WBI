const express = require('express');
const router = express.Router();
const multipleServicesEnquiryController = require('../../controllers/multipleServicesEnquiry.controller');

// Create a new enquiry (Public)
router.post('/', multipleServicesEnquiryController.createEnquiry);

module.exports = router;
