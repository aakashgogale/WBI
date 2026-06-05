const express = require('express');
const router = express.Router();
const {
  getActiveTrustVideos,
  getTrustVideoById
} = require('../../controllers/publicControllers/trustVideoController');

// Public routes - no authentication required
router.get('/trust-videos', getActiveTrustVideos);
router.get('/trust-videos/:id', getTrustVideoById);

module.exports = router;
