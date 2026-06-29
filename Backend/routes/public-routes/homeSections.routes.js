const express = require('express');
const router = express.Router();
const {
  getSection,
  getCarePlan,
  getWhyChoose,
  getHowItWorks
} = require('../../controllers/adminControllers/homeSectionController');

// Route for specific section keys
router.get('/care-plan', getCarePlan);
router.get('/why-choose', getWhyChoose);
router.get('/how-it-works', getHowItWorks);
router.get('/:sectionKey', getSection);

module.exports = router;
