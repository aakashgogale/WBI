const express = require('express');
const router = express.Router();
const { submitEnquiry } = require('../../controllers/crmEnquiry.controller');

router.post('/', submitEnquiry);

module.exports = router;
