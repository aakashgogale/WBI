const TrustVideo = require('../../models/TrustVideo');

/**
 * Get active trust videos (public)
 * GET /api/public/trust-videos
 */
const getActiveTrustVideos = async (req, res) => {
  try {
    const videos = await TrustVideo.find({ isActive: true })
      .sort({ displayOrder: 1, createdAt: -1 })
      .select('title description serviceCategory thumbnail videoUrl videoType rating isFeatured isMuted')
      .lean();

    res.json({ success: true, videos });
  } catch (error) {
    console.error('Error fetching active trust videos:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch trust videos' });
  }
};

/**
 * Get single trust video by ID (public)
 * GET /api/public/trust-videos/:id
 */
const getTrustVideoById = async (req, res) => {
  try {
    const video = await TrustVideo.findOne({ _id: req.params.id, isActive: true })
      .select('title description serviceCategory thumbnail videoUrl videoType rating isFeatured isMuted')
      .lean();

    if (!video) {
      return res.status(404).json({ success: false, message: 'Video not found' });
    }

    res.json({ success: true, video });
  } catch (error) {
    console.error('Error fetching trust video:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch trust video' });
  }
};

module.exports = {
  getActiveTrustVideos,
  getTrustVideoById
};
