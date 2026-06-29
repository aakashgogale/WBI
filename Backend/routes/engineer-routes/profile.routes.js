const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { authenticate } = require('../../middleware/authMiddleware');
const { isEngineer } = require('../../middleware/roleMiddleware');
const { 
  getProfile, updateProfile, updateLocation,
  getProfileCompletion, updateBankDetails, updateWorkLocations, updateDocuments, updateSkillsProfile, uploadProfilePhoto 
} = require('../../controllers/engineerControllers/engineerProfileController');

// Validation rules
const updateProfileValidation = [
  body('name').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('serviceCategory').optional().trim().isLength({ max: 50 }).withMessage('Service category must be less than 50 characters'),
  body('skills').optional().isArray().withMessage('Skills must be an array')
];

// Routes
router.get('/profile', authenticate, isEngineer, getProfile);
router.put('/profile', authenticate, isEngineer, updateProfileValidation, updateProfile);
router.put('/profile/skills', authenticate, isEngineer, updateSkillsProfile);
router.put('/profile/location', authenticate, isEngineer, updateLocation);

const { uploadProfileImage } = require('../../middleware/uploadMiddleware');

router.get('/profile/completion', authenticate, isEngineer, getProfileCompletion);
router.put('/profile/bank-details', authenticate, isEngineer, updateBankDetails);
router.put('/profile/work-locations', authenticate, isEngineer, updateWorkLocations);
router.post('/profile/documents', authenticate, isEngineer, updateDocuments);
router.post('/profile/photo', authenticate, isEngineer, uploadProfileImage, uploadProfilePhoto);

module.exports = router;

