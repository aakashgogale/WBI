const express = require('express');
const router = express.Router();
const vsatServiceController = require('../../controllers/vsatService.controller');

// Create a new enquiry (Public)
router.post('/', vsatServiceController.createEnquiry);

module.exports = router;
