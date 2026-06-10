const express = require('express');
const router = express.Router();
const qcTestController = require('../../controllers/qcTest.controller');

router.post('/', qcTestController.createEnquiry);

module.exports = router;
