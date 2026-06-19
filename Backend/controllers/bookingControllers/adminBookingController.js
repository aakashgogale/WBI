const Booking = require('../../models/Booking');
const { validationResult } = require('express-validator');
const { BOOKING_STATUS } = require('../../utils/constants');

/**
 * Get all bookings with filters and search
 */
const getAllBookings = async (req, res) => {
  try {
    const {
      status,
      paymentStatus,
      userId,
      vendorId,
      workerId,
      startDate,
      endDate,
      search,
      page = 1,
      limit = 20
    } = req.query;

    // Build query
    const query = {};

    if (status) query.status = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (userId) query.userId = userId;
    if (vendorId) query.vendorId = vendorId;
    if (workerId) query.workerId = workerId;

    if (startDate || endDate) {
      query.scheduledDate = {};
      if (startDate) query.scheduledDate.$gte = new Date(startDate);
      if (endDate) query.scheduledDate.$lte = new Date(endDate);
    }

    // Search by booking number or service name
    if (search) {
      query.$or = [
        { bookingNumber: { $regex: search, $options: 'i' } },
        { serviceName: { $regex: search, $options: 'i' } }
      ];
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute find and count in parallel to cut latency
    const [bookings, total] = await Promise.all([
      Booking.find(query)
        .populate('userId', 'name phone email')
        .populate('vendorId', 'name businessName phone')
        .populate('serviceId', 'title iconUrl')
        .populate('categoryId', 'title slug')
        .populate('workerId', 'name phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Booking.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      data: bookings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get all bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings. Please try again.'
    });
  }
};

/**
 * Get booking details by ID
 */
const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id)
      .populate('userId', 'name phone email addresses')
      .populate('vendorId', 'name businessName phone email address')
      .populate('serviceId', 'title description iconUrl images')
      .populate('categoryId', 'title slug')
      .populate('workerId', 'name phone rating totalJobs completedJobs');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch booking. Please try again.'
    });
  }
};

/**
 * Cancel booking (admin)
 */
const cancelBooking = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { cancellationReason } = req.body;

    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.status === BOOKING_STATUS.CANCELLED) {
      return res.status(400).json({
        success: false,
        message: 'Booking is already cancelled'
      });
    }

    if (booking.status === BOOKING_STATUS.COMPLETED) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel completed booking'
      });
    }

    // Update booking
    booking.status = BOOKING_STATUS.CANCELLED;
    booking.cancelledAt = new Date();
    booking.cancelledBy = 'admin';
    booking.cancellationReason = cancellationReason || 'Cancelled by admin';

    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      data: booking
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel booking. Please try again.'
    });
  }
};

/**
 * Get booking analytics
 */
const getBookingAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Build date filter
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    // Total bookings
    const totalBookings = await Booking.countDocuments(dateFilter);

    // Bookings by status
    const bookingsByStatus = await Booking.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Bookings by payment status
    const bookingsByPaymentStatus = await Booking.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$paymentStatus',
          count: { $sum: 1 },
          totalAmount: { $sum: '$finalAmount' }
        }
      }
    ]);

    // Revenue analytics
    const revenueStats = await Booking.aggregate([
      {
        $match: {
          ...dateFilter,
          paymentStatus: 'success'
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$finalAmount' },
          totalBookings: { $sum: 1 },
          averageBookingValue: { $avg: '$finalAmount' }
        }
      }
    ]);

    // Daily bookings trend (last 30 days)
    const dailyTrend = await Booking.aggregate([
      {
        $match: {
          ...dateFilter,
          createdAt: {
            $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 },
          revenue: { $sum: '$finalAmount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalBookings,
        bookingsByStatus: bookingsByStatus.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        bookingsByPaymentStatus: bookingsByPaymentStatus.reduce((acc, item) => {
          acc[item._id] = {
            count: item.count,
            totalAmount: item.totalAmount
          };
          return acc;
        }, {}),
        revenue: revenueStats[0] || {
          totalRevenue: 0,
          totalBookings: 0,
          averageBookingValue: 0
        },
        dailyTrend
      }
    });
  } catch (error) {
    console.error('Get booking analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics. Please try again.'
    });
  }
};

const autoAssignProvider = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.status !== BOOKING_STATUS.PENDING) {
      return res.status(400).json({
        success: false,
        message: `Booking is currently in ${booking.status} status. Only PENDING bookings can be auto-assigned.`
      });
    }

    // Add to bookingDispatchQueue with 0 delay
    const { bookingDispatchQueue } = require('../../jobs/queueSetup');
    await bookingDispatchQueue.add('auto-escalate', { bookingId: booking._id }, { delay: 0 });

    res.status(200).json({
      success: true,
      message: 'Booking successfully queued for auto-assignment. Workers will be notified immediately.'
    });
  } catch (error) {
    console.error('Auto assign provider error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to auto assign provider. Please try again.'
    });
  }
};

const getBookingMatchingStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findById(bookingId).populate('workerId', 'name phone rating status');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const WorkerAssignmentAttempt = require('../../models/WorkerAssignmentAttempt');
    const BookingAssignmentLog = require('../../models/BookingAssignmentLog');

    const attempts = await WorkerAssignmentAttempt.find({ bookingId })
      .populate('workerId', 'name phone status')
      .sort({ createdAt: -1 });

    const logs = await BookingAssignmentLog.find({ bookingId }).sort({ createdAt: -1 });

    const eligibleWorkerIds = [...new Set(logs.filter(l => l.action === 'Request Sent' || l.action === 'Worker Filtered').map(l => l.workerId?.toString()).filter(Boolean))];
    const requestsSentCount = attempts.length;

    const radiusLog = logs.find(l => l.metadata?.radiusKm);
    const currentRadius = radiusLog ? radiusLog.metadata.radiusKm : 5;

    const Worker = require('../../models/Worker');
    const eligibleWorkers = await Worker.find({ _id: { $in: eligibleWorkerIds } })
      .select('name phone status rating profilePhoto');

    res.status(200).json({
      success: true,
      data: {
        matchingStatus: booking.status,
        workersFound: eligibleWorkers.length,
        eligibleWorkers: eligibleWorkers,
        requestsSent: requestsSentCount,
        currentRadius: currentRadius,
        assignedWorker: booking.workerId,
        lastAttemptStatus: attempts[0] ? attempts[0].status : 'none',
        attempts
      }
    });
  } catch (error) {
    console.error('Get booking matching status error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const assignWorker = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { workerId } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const Worker = require('../../models/Worker');
    const worker = await Worker.findById(workerId);
    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker not found' });
    }

    booking.workerId = workerId;
    booking.status = 'worker_assigned';
    booking.assignedAt = new Date();
    await booking.save();

    worker.status = 'BUSY';
    await worker.save();

    const BookingTimeline = require('../../models/BookingTimeline');
    await BookingTimeline.create({
      bookingId,
      status: 'worker_assigned',
      title: 'Technician Assigned',
      message: `Admin manually assigned ${worker.name} for this service.`,
      actorRole: 'admin'
    });

    const { getIO } = require('../../sockets');
    const io = getIO();
    io.to(`booking_${bookingId}`).emit('booking:assigned', {
      bookingId,
      workerId,
      workerName: worker.name
    });
    io.to('admin:wbi').emit('admin:workerAccepted', { bookingId, workerId });

    res.status(200).json({ success: true, message: 'Worker assigned successfully', data: booking });
  } catch (error) {
    console.error('Assign worker error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const reassignWorker = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { workerId } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const Worker = require('../../models/Worker');
    const oldWorkerId = booking.workerId;
    if (oldWorkerId) {
      await Worker.findByIdAndUpdate(oldWorkerId, { status: 'ONLINE' });
    }

    const worker = await Worker.findById(workerId);
    if (!worker) {
      return res.status(404).json({ success: false, message: 'New worker not found' });
    }

    booking.workerId = workerId;
    booking.status = 'worker_assigned';
    booking.assignedAt = new Date();
    await booking.save();

    worker.status = 'BUSY';
    await worker.save();

    const BookingTimeline = require('../../models/BookingTimeline');
    await BookingTimeline.create({
      bookingId,
      status: 'worker_assigned',
      title: 'Technician Reassigned',
      message: `Admin reassigned booking to ${worker.name}.`,
      actorRole: 'admin'
    });

    const { getIO } = require('../../sockets');
    const io = getIO();
    io.to(`booking_${bookingId}`).emit('booking:assigned', {
      bookingId,
      workerId,
      workerName: worker.name
    });
    io.to('admin:wbi').emit('admin:workerAccepted', { bookingId, workerId });

    res.status(200).json({ success: true, message: 'Worker reassigned successfully', data: booking });
  } catch (error) {
    console.error('Reassign worker error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const updateBookingStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    booking.status = status;
    if (status === 'completed') {
      booking.completedAt = new Date();
      if (booking.workerId) {
        const Worker = require('../../models/Worker');
        await Worker.findByIdAndUpdate(booking.workerId, { status: 'ONLINE' });
      }
    }
    await booking.save();

    const BookingTimeline = require('../../models/BookingTimeline');
    await BookingTimeline.create({
      bookingId,
      status: status,
      title: 'Status Updated',
      message: `Booking status manually updated to ${status} by admin.`,
      actorRole: 'admin'
    });

    const { getIO } = require('../../sockets');
    const io = getIO();
    io.to(`booking_${bookingId}`).emit('booking_updated', { bookingId, status });
    io.to('admin:wbi').emit('booking_updated', { bookingId, status });

    res.status(200).json({ success: true, message: `Status updated to ${status}`, data: booking });
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const addAdminNote = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { note } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    booking.adminLog.push({
      action: 'Admin Note Added',
      reason: note,
      timestamp: new Date()
    });
    await booking.save();

    res.status(200).json({ success: true, message: 'Admin note added successfully', data: booking });
  } catch (error) {
    console.error('Add admin note error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getBookingTimeline = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const BookingTimeline = require('../../models/BookingTimeline');
    const timeline = await BookingTimeline.find({ bookingId }).sort({ createdAt: 1 });
    res.status(200).json({ success: true, data: timeline });
  } catch (error) {
    console.error('Get booking timeline error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getBookingLogs = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const BookingAssignmentLog = require('../../models/BookingAssignmentLog');
    const logs = await BookingAssignmentLog.find({ bookingId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: logs });
  } catch (error) {
    console.error('Get booking logs error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getBookingPayment = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    res.status(200).json({
      success: true,
      data: {
        paymentStatus: booking.paymentStatus,
        paymentMethod: booking.paymentMethod,
        paymentId: booking.paymentId,
        finalAmount: booking.finalAmount,
        basePrice: booking.basePrice,
        tax: booking.tax,
        visitingCharges: booking.visitingCharges,
        penalty: booking.penalty,
        extraCharges: booking.extraCharges
      }
    });
  } catch (error) {
    console.error('Get booking payment error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const paymentAction = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { action } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (action === 'refund') {
      booking.paymentStatus = 'refunded';
    } else if (action === 'hold') {
      booking.paymentStatus = 'held';
    } else if (action === 'release') {
      booking.paymentStatus = 'success';
    }
    await booking.save();

    res.status(200).json({ success: true, message: `Payment action ${action} performed successfully`, data: booking });
  } catch (error) {
    console.error('Payment action error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getAllBookings,
  getBookingById,
  cancelBooking,
  getBookingAnalytics,
  autoAssignProvider,
  getBookingMatchingStatus,
  assignWorker,
  reassignWorker,
  updateBookingStatus,
  addAdminNote,
  getBookingTimeline,
  getBookingLogs,
  getBookingPayment,
  paymentAction
};

