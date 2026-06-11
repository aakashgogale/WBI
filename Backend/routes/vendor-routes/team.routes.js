const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/authMiddleware');
const { isVendor } = require('../../middleware/roleMiddleware');
const { getTeamOverview, getTeamMembers } = require('../../controllers/vendorControllers/vendorTeamController');

// Routes
router.get('/overview', authenticate, isVendor, getTeamOverview);
router.get('/members', authenticate, isVendor, getTeamMembers);

module.exports = router;
