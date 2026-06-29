const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/authMiddleware');
const { isAdmin } = require('../../middleware/roleMiddleware');
const {
  createCarePlan,
  createWhyChoose,
  createHowItWorks,
  updateSectionById
} = require('../../controllers/adminControllers/homeSectionController');

// All routes require authentication and admin privileges
router.use(authenticate, isAdmin);

// Care Plan Banner
router.post('/home-sections/care-plan', createCarePlan);
router.patch('/home-sections/care-plan/:id', updateSectionById);

// Why Choose WBI
router.post('/home-sections/why-choose', createWhyChoose);
router.patch('/home-sections/why-choose/:id', updateSectionById);

// How It Works
router.post('/home-sections/how-it-works', createHowItWorks);
router.patch('/home-sections/how-it-works/:id', updateSectionById);

module.exports = router;
