const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/authMiddleware');
const { isAdmin } = require('../../middleware/roleMiddleware');
const {
  getAllTrustVideos,
  getTrustVideoById,
  createTrustVideo,
  updateTrustVideo,
  deleteTrustVideo,
  toggleTrustVideoStatus
} = require('../../controllers/adminControllers/trustVideoController');

// All routes require authentication and admin role
router.use(authenticate, isAdmin);

// Get all trust videos
router.get('/trust-videos', getAllTrustVideos);

// Get single trust video
router.get('/trust-videos/:id', getTrustVideoById);

// Create new trust video
router.post('/trust-videos', createTrustVideo);

// Update trust video
router.put('/trust-videos/:id', updateTrustVideo);

// Delete trust video
router.delete('/trust-videos/:id', deleteTrustVideo);

// Toggle trust video active status
router.patch('/trust-videos/:id/status', toggleTrustVideoStatus);

module.exports = router;
