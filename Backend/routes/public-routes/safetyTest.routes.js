const express = require('express');
const router = express.Router();
const safetyTestController = require('../../controllers/safetyTest.controller');

router.post('/', safetyTestController.createEnquiry);

module.exports = router;
