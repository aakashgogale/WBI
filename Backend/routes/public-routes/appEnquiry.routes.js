const express = require('express');
const router = express.Router();
const { submitEnquiry } = require('../../controllers/appEnquiry.controller');

router.post('/', submitEnquiry);

module.exports = router;
