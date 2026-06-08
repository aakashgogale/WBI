const express = require('express');
const router = express.Router();
const barcodeReaderServiceController = require('../../controllers/barcodeReaderService.controller');

// Create a new enquiry (Public)
router.post('/', barcodeReaderServiceController.createEnquiry);

module.exports = router;
