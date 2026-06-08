const express = require('express');
const router = express.Router();
const breakdownEnquiryController = require('../../controllers/breakdownEnquiry.controller');

router.post('/', breakdownEnquiryController.submitEnquiry);

module.exports = router;
