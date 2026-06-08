const express = require('express');
const router = express.Router();
const cdmServiceController = require('../../controllers/cdmService.controller');

// Create a new enquiry (Public)
router.post('/', cdmServiceController.createEnquiry);

module.exports = router;
