const express = require('express');
const router = express.Router();
const controller = require('../../controllers/upsBatteryService.controller');

// Create a new enquiry (Public)
router.post('/', controller.createEnquiry);

module.exports = router;