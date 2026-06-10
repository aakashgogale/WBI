const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/authMiddleware');
const { isEngineer } = require('../../middleware/roleMiddleware');
const { getDashboardStats } = require('../../controllers/engineerControllers/engineerDashboardController');

// Routes
router.get('/stats', authenticate, isEngineer, getDashboardStats);

module.exports = router;
