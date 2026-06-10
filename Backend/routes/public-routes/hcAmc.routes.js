const express = require('express');
const router = express.Router();
const hcAmcController = require('../../controllers/hcAmc.controller');

router.post('/', hcAmcController.createEnquiry);

module.exports = router;
