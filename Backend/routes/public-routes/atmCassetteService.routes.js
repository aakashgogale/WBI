const express = require('express');
const router = express.Router();
const atmCassetteServiceController = require('../../controllers/atmCassetteService.controller');

// Create a new enquiry (Public)
router.post('/', atmCassetteServiceController.createEnquiry);

module.exports = router;
