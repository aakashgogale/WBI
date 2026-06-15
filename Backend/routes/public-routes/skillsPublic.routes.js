const express = require('express');
const router = express.Router();
const { getPublicSkillsAndTools } = require('../../controllers/publicControllers/subServicePublicController');

router.get('/', getPublicSkillsAndTools);

module.exports = router;
