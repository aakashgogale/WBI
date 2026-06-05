const Review = require('../../models/Review');
const Booking = require('../../models/Booking');

/**
 * Get all reviews for admin panel with filtering and pagination
 * GET /api/admin/reviews
 */
exports.getAllReviews = async (req, res) => {
  try {
    const { status, page = 1, limit = 20, search } = req.query;
    const query = {};

    // Filter by status if provided
    if (status && status !== 'all') {
      query.status = status;
    }

    // Build the aggregation pipeline to allow searching by user/service name
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // We use populate to get user and service details
    let reviewsQuery = Review.find(query)
      .populate('userId', 'name email avatar phone')
      .populate('serviceId', 'title')
      .populate('vendorId', 'businessName')
      .sort({ createdAt: -1 });

    const total = await Review.countDocuments(query);
    const reviews = await reviewsQuery.skip(skip).limit(limitNum);

    // Filter by search term manually if search is provided (since we can't easily search populated fields in a basic find query)
    let filteredReviews = reviews;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredReviews = reviews.filter(r => 
        (r.userId?.name && r.userId.name.toLowerCase().includes(searchLower)) ||
        (r.serviceId?.title && r.serviceId.title.toLowerCase().includes(searchLower)) ||
        (r.review && r.review.toLowerCase().includes(searchLower))
      );
    }

    res.status(200).json({
      success: true,
      reviews: filteredReviews,
      pagination: {
        total: search ? filteredReviews.length : total,
        page: pageNum,
        pages: Math.ceil((search ? filteredReviews.length : total) / limitNum)
      }
    });

  } catch (error) {
    console.error('Error fetching admin reviews:', error);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

/**
 * Update review status (Approve/Reject)
 * PUT /api/admin/reviews/:id/status
 */
exports.updateReviewStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'approved', 'rejected', 'active', 'hidden', 'deleted'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    review.status = status;
    await review.save();

    // If approved, we might want to recalculate the service's average rating here or rely on dynamic aggregation
    // For now, dynamic aggregation on the public route is usually safer and more real-time.

    res.status(200).json({
      success: true,
      message: `Review status updated to ${status}`,
      review
    });

  } catch (error) {
    console.error('Error updating review status:', error);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};
