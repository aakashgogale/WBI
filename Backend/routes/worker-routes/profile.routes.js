const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { authenticate } = require('../../middleware/authMiddleware');
const { isWorker } = require('../../middleware/roleMiddleware');
const { 
  getProfile, updateProfile, updateLocation,
  getProfileCompletion, updateBankDetails, updateWorkLocations, updateDocuments, updateSkillsProfile, uploadProfilePhoto 
} = require('../../controllers/workerControllers/workerProfileController');

// Validation rules
const updateProfileValidation = [
  body('name').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('serviceCategory').optional().trim().isLength({ max: 50 }).withMessage('Service category must be less than 50 characters'),
  body('skills').optional().isArray().withMessage('Skills must be an array')
];

// Routes
router.get('/profile', authenticate, isWorker, getProfile);
router.put('/profile', authenticate, isWorker, updateProfileValidation, updateProfile);
router.put('/profile/skills', authenticate, isWorker, updateSkillsProfile);
router.put('/profile/location', authenticate, isWorker, updateLocation);

const { uploadProfileImage } = require('../../middleware/uploadMiddleware');

router.get('/profile/completion', authenticate, isWorker, getProfileCompletion);
router.put('/profile/bank-details', authenticate, isWorker, updateBankDetails);
router.put('/profile/work-locations', authenticate, isWorker, updateWorkLocations);
router.post('/profile/documents', authenticate, isWorker, updateDocuments);
router.post('/profile/photo', authenticate, isWorker, uploadProfileImage, uploadProfilePhoto);

module.exports = router;

