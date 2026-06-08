const express = require('express');
const router = express.Router();
const { createEnquiry } = require('../../controllers/webEnquiry.controller');

// @route   POST /api/public/web-enquiries
// @desc    Submit a new web development enquiry
// @access  Public
router.post('/', createEnquiry);

module.exports = router;
