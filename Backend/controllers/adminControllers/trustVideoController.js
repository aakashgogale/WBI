const TrustVideo = require('../../models/TrustVideo');

/**
 * Get all trust videos (admin)
 * GET /api/admin/trust-videos
 */
const getAllTrustVideos = async (req, res) => {
  try {
    const { search, isActive, isFeatured, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (isFeatured !== undefined) filter.isFeatured = isFeatured === 'true';
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { serviceCategory: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await TrustVideo.countDocuments(filter);
    const videos = await TrustVideo.find(filter)
      .sort({ displayOrder: 1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    res.json({
      success: true,
      videos,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching trust videos:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch trust videos', error: error.message });
  }
};

/**
 * Get single trust video (admin)
 * GET /api/admin/trust-videos/:id
 */
const getTrustVideoById = async (req, res) => {
  try {
    const video = await TrustVideo.findById(req.params.id).lean();
    if (!video) {
      return res.status(404).json({ success: false, message: 'Trust video not found' });
    }
    res.json({ success: true, video });
  } catch (error) {
    console.error('Error fetching trust video:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch trust video', error: error.message });
  }
};

/**
 * Create trust video (admin)
 * POST /api/admin/trust-videos
 */
const createTrustVideo = async (req, res) => {
  try {
    const { title, description, serviceCategory, thumbnail, videoUrl, videoType, rating, isActive, isFeatured, isMuted, displayOrder } = req.body;

    if (!title || !serviceCategory || !thumbnail || !videoUrl) {
      return res.status(400).json({ success: false, message: 'Title, serviceCategory, thumbnail, and videoUrl are required' });
    }

    const video = await TrustVideo.create({
      title,
      description: description || '',
      serviceCategory,
      thumbnail,
      videoUrl,
      videoType: videoType || 'url',
      rating: rating || 4.8,
      isActive: isActive !== undefined ? isActive : true,
      isFeatured: isFeatured || false,
      isMuted: isMuted || false,
      displayOrder: displayOrder || 0
    });

    res.status(201).json({ success: true, video, message: 'Trust video created successfully' });
  } catch (error) {
    console.error('Error creating trust video:', error);
    res.status(500).json({ success: false, message: 'Failed to create trust video', error: error.message });
  }
};

/**
 * Update trust video (admin)
 * PUT /api/admin/trust-videos/:id
 */
const updateTrustVideo = async (req, res) => {
  try {
    const { title, description, serviceCategory, thumbnail, videoUrl, videoType, rating, isActive, isFeatured, isMuted, displayOrder } = req.body;

    const video = await TrustVideo.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ success: false, message: 'Trust video not found' });
    }

    if (title !== undefined) video.title = title;
    if (description !== undefined) video.description = description;
    if (serviceCategory !== undefined) video.serviceCategory = serviceCategory;
    if (thumbnail !== undefined) video.thumbnail = thumbnail;
    if (videoUrl !== undefined) video.videoUrl = videoUrl;
    if (videoType !== undefined) video.videoType = videoType;
    if (rating !== undefined) video.rating = rating;
    if (isActive !== undefined) video.isActive = isActive;
    if (isFeatured !== undefined) video.isFeatured = isFeatured;
    if (isMuted !== undefined) video.isMuted = isMuted;
    if (displayOrder !== undefined) video.displayOrder = displayOrder;

    await video.save();

    res.json({ success: true, video, message: 'Trust video updated successfully' });
  } catch (error) {
    console.error('Error updating trust video:', error);
    res.status(500).json({ success: false, message: 'Failed to update trust video', error: error.message });
  }
};

/**
 * Delete trust video (admin)
 * DELETE /api/admin/trust-videos/:id
 */
const deleteTrustVideo = async (req, res) => {
  try {
    const video = await TrustVideo.findByIdAndDelete(req.params.id);
    if (!video) {
      return res.status(404).json({ success: false, message: 'Trust video not found' });
    }
    res.json({ success: true, message: 'Trust video deleted successfully' });
  } catch (error) {
    console.error('Error deleting trust video:', error);
    res.status(500).json({ success: false, message: 'Failed to delete trust video', error: error.message });
  }
};

/**
 * Toggle trust video status (admin)
 * PATCH /api/admin/trust-videos/:id/status
 */
const toggleTrustVideoStatus = async (req, res) => {
  try {
    const video = await TrustVideo.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ success: false, message: 'Trust video not found' });
    }

    // Allow explicit isActive value or toggle
    if (req.body.isActive !== undefined) {
      video.isActive = req.body.isActive;
    } else {
      video.isActive = !video.isActive;
    }

    await video.save();

    res.json({
      success: true,
      video,
      message: `Trust video ${video.isActive ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    console.error('Error toggling trust video status:', error);
    res.status(500).json({ success: false, message: 'Failed to update status', error: error.message });
  }
};

module.exports = {
  getAllTrustVideos,
  getTrustVideoById,
  createTrustVideo,
  updateTrustVideo,
  deleteTrustVideo,
  toggleTrustVideoStatus
};
