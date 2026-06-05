const express = require('express');
const router = express.Router();
const reviewController = require('../../controllers/adminControllers/reviewController');
const { protect, admin } = require('../../middleware/authMiddleware');

// All review routes should be protected and restricted to admins
router.use(protect);
router.use(admin);

// Route to get all reviews (with status filtering)
router.get('/', reviewController.getAllReviews);

// Route to update a review's status (approve/reject)
router.put('/:id/status', reviewController.updateReviewStatus);

module.exports = router;
