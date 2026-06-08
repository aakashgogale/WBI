const express = require('express');
const router = express.Router();
const passbookPrinterServiceController = require('../../controllers/passbookPrinterService.controller');

// Create a new enquiry (Public)
router.post('/', passbookPrinterServiceController.createEnquiry);

module.exports = router;
