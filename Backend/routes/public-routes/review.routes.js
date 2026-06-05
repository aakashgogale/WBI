const express = require('express');
const router = express.Router();
const { getServiceReviews } = require('../../controllers/publicControllers/publicReviewController');

// GET /api/public/reviews/service/:serviceId
router.get('/service/:serviceId', getServiceReviews);

module.exports = router;
