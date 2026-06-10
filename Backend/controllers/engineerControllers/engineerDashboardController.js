const Booking = require('../../models/Booking');
const Engineer = require('../../models/Engineer');
const WorkerProject = require('../../models/WorkerProject');
const { BOOKING_STATUS } = require('../../utils/constants');

/**
 * Get engineer dashboard statistics
 */
const getDashboardStats = async (req, res) => {
  try {
    const engineerId = req.user.id;

    // Get Engineer Profile for Rating (fallback)
    const engineer = await Engineer.findById(engineerId);

    if (!engineer) {
      return res.status(404).json({
        success: false,
        message: 'Engineer not found'
      });
    }

    // 2. Calculate Total Earnings
    // Aggregate from completed bookings where engineerId matches
    const earningStats = await Booking.aggregate([
      {
        $match: {
          engineerId: engineer._id,
          status: { $in: [BOOKING_STATUS.COMPLETED, BOOKING_STATUS.WORK_DONE] }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$finalAmount" }
        }
      }
    ]);

    const totalEarnings = earningStats.length > 0 ? earningStats[0].total : 0;

    // 3. Count Active Jobs (Assigned, Visited, In Progress)
    const activeJobsCount = await Booking.countDocuments({
      engineerId: engineer._id,
      status: {
        $in: [
          BOOKING_STATUS.ASSIGNED,
          BOOKING_STATUS.VISITED,
          BOOKING_STATUS.IN_PROGRESS,
          BOOKING_STATUS.CONFIRMED
        ]
      }
    });

    // 4. Count Active Projects
    const activeProjectsCount = await WorkerProject.countDocuments({
      engineerId: engineer._id,
      status: { $in: ['PENDING', 'IN_PROGRESS'] }
    });

    // 5. Count Completed Jobs
    const completedJobsCount = await Booking.countDocuments({
      engineerId: engineer._id,
      status: { $in: [BOOKING_STATUS.COMPLETED, BOOKING_STATUS.WORK_DONE] }
    });

    // 6. Calculate Average Rating
    const ratingStats = await Booking.aggregate([
      {
        $match: {
          engineerId: engineer._id,
          rating: { $exists: true, $ne: null }
        }
      },
      {
        $group: {
          _id: null,
          avgRating: { $avg: "$rating" }
        }
      }
    ]);

    const averageRating = ratingStats.length > 0 ? parseFloat(ratingStats[0].avgRating.toFixed(1)) : (engineer.rating || 0);

    // 7. Get Recent Jobs
    const recentJobs = await Booking.find({ engineerId: engineer._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('userId', 'name')
      .populate('serviceId', 'title categoryIcon');

    res.status(200).json({
      success: true,
      data: {
        totalEarnings,
        activeJobs: activeJobsCount,
        activeProjects: activeProjectsCount,
        completedJobs: completedJobsCount,
        rating: averageRating,
        recentJobs
      }
    });

  } catch (error) {
    console.error('Get engineer dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics'
    });
  }
};

module.exports = {
  getDashboardStats
};
