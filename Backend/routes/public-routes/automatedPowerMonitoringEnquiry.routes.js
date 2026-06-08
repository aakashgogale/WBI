const express = require('express');
const router = express.Router();
const automatedPowerMonitoringEnquiryController = require('../../controllers/automatedPowerMonitoringEnquiry.controller');

// Create a new enquiry (Public)
router.post('/', automatedPowerMonitoringEnquiryController.createEnquiry);

module.exports = router;
