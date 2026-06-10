const express = require('express');
const router = express.Router();
const hcPmController = require('../../controllers/hcPm.controller');

router.post('/', hcPmController.createEnquiry);

module.exports = router;
