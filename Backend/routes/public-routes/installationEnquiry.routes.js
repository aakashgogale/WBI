const express = require('express');
const router = express.Router();
const installationEnquiryController = require('../../controllers/installationEnquiry.controller');

router.post('/', installationEnquiryController.submitEnquiry);

module.exports = router;
