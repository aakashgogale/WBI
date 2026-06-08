const express = require('express');
const router = express.Router();
const designEnquiryController = require('../../controllers/designEnquiry.controller');

// Public route for submitting Design enquiries
router.post('/', designEnquiryController.submitEnquiry);

module.exports = router;
