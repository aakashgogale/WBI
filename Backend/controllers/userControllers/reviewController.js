const Review = require('../../models/Review');
const Booking = require('../../models/Booking');

/**
 * Submit a review for a completed booking
 * POST /api/users/reviews
 */
exports.submitReview = async (req, res) => {
  try {
    const { bookingId, serviceId, vendorId, workerId, rating, review, images } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!bookingId || !serviceId || !vendorId || !rating) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Check if booking exists and belongs to user
    const booking = await Booking.findOne({ _id: bookingId, userId });
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Check if a review already exists for this booking
    const existingReview = await Review.findOne({ bookingId });
    if (existingReview) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this booking' });
    }

    // Create new review (status defaults to 'pending')
    const newReview = await Review.create({
      bookingId,
      userId,
      serviceId,
      vendorId,
      workerId,
      rating,
      review,
      images: images || [],
      status: 'pending'
    });

    // Also update the booking document to keep legacy data in sync if needed
    booking.rating = rating;
    booking.review = review;
    booking.reviewedAt = new Date();
    booking.status = 'closed';
    await booking.save();

    if (workerId) {
      const Worker = require('../../models/Worker');
      await Worker.findByIdAndUpdate(workerId, { $inc: { totalJobsCompleted: 1 } });
    }

    const { getIO } = require('../../sockets');
    getIO().to(`booking_${bookingId}`).emit('booking:closed', { bookingId });

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully and is pending approval.',
      review: newReview
    });

  } catch (error) {
    console.error('Submit review error:', error);
    res.status(500).json({ success: false, message: 'Failed to submit review' });
  }
};
