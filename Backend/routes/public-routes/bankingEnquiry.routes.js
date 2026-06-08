const express = require('express');
const router = express.Router();
const { createEnquiry } = require('../../controllers/bankingEnquiry.controller');

// @route   POST /api/public/banking-enquiries
// @desc    Submit a new banking enquiry
// @access  Public
router.post('/', createEnquiry);

module.exports = router;
