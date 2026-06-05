const mongoose = require('mongoose');
const Review = require('../../models/Review');

/**
 * Get approved reviews for a specific service including aggregates
 * GET /api/public/reviews/service/:serviceId
 */
exports.getServiceReviews = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const query = { 
      status: { $in: ['approved', 'active'] } 
    };

    if (serviceId !== 'all') {
      query.serviceId = serviceId;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get individual reviews
    const reviews = await Review.find(query)
      .populate('userId', 'name profilePhoto')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Review.countDocuments(query);

    // Get Aggregates (average rating and count per star)
    const matchStage = { status: { $in: ['approved', 'active'] } };
    if (serviceId !== 'all') {
      matchStage.serviceId = new mongoose.Types.ObjectId(serviceId);
    }

    const stats = await Review.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          star5: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
          star4: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
          star3: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
          star2: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
          star1: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } },
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: reviews,
      stats: stats[0] || { averageRating: 0, totalReviews: 0, star5: 0, star4: 0, star3: 0, star2: 0, star1: 0 },
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Get public reviews error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch reviews' });
  }
};
