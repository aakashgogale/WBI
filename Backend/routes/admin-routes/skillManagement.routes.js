const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/authMiddleware');
const { isAdmin } = require('../../middleware/roleMiddleware');
const {
  getAllSkills,
  createSkill,
  updateSkill,
  deleteSkill
} = require('../../controllers/adminControllers/skillController');

router.get('/', authenticate, isAdmin, getAllSkills);
router.post('/', authenticate, isAdmin, createSkill);
router.put('/:id', authenticate, isAdmin, updateSkill);
router.delete('/:id', authenticate, isAdmin, deleteSkill);

module.exports = router;
