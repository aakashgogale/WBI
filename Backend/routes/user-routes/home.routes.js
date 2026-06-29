const express = require('express');
const router = express.Router();
const { getHomeData, getHomeServices } = require('../../controllers/userControllers/userHome.controller');

// GET /api/user/home
router.get('/', getHomeData);

// GET /api/user/home/services
router.get('/services', getHomeServices);

module.exports = router;
