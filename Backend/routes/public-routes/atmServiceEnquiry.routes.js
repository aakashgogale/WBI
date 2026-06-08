const express = require('express');
const router = express.Router();
const atmServiceEnquiryController = require('../../controllers/atmServiceEnquiry.controller');

// Create a new enquiry (Public)
router.post('/', atmServiceEnquiryController.createEnquiry);

module.exports = router;
