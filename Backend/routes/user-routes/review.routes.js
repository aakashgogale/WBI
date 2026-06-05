const express = require('express');
const router = express.Router();
const reviewController = require('../../controllers/userControllers/reviewController');
const { authenticate } = require('../../middleware/authMiddleware');

// All user review routes require authentication
router.use(authenticate);

// POST /api/users/reviews
router.post('/', reviewController.submitReview);

module.exports = router;
