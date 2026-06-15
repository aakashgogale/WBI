const express = require('express');
const router = express.Router();
const { getPublicSubServices } = require('../../controllers/publicControllers/subServicePublicController');

router.get('/', getPublicSubServices);

module.exports = router;
