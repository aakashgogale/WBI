const express = require('express');
const router = express.Router();
const maintenanceEnquiryController = require('../../controllers/maintenanceEnquiry.controller');

router.post('/', maintenanceEnquiryController.submitEnquiry);

module.exports = router;
