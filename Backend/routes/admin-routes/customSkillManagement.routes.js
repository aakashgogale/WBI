const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/authMiddleware');
const { isAdmin } = require('../../middleware/roleMiddleware');
const {
  getPendingCustomSkills,
  updateCustomSkillStatus
} = require('../../controllers/adminControllers/customSkillController');

router.get('/', authenticate, isAdmin, getPendingCustomSkills);
router.patch('/status', authenticate, isAdmin, updateCustomSkillStatus);

module.exports = router;
