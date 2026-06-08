const express = require('express');
const router = express.Router();
const posServiceController = require('../../controllers/posService.controller');

// Create a new enquiry (Public)
router.post('/', posServiceController.createEnquiry);

module.exports = router;
