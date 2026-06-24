const express = require('express');
const router = express.Router();
const { getHomeData } = require('../../controllers/userControllers/userHome.controller');

// GET /api/user/home
router.get('/', getHomeData);

module.exports = router;
