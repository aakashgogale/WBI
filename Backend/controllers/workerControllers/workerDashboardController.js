const Booking = require('../../models/Booking');
const Worker = require('../../models/Worker');
const WorkerProject = require('../../models/WorkerProject');
const { BOOKING_STATUS } = require('../../utils/constants');

/**
 * Get worker dashboard statistics
 */
const getDashboardStats = async (req, res) => {
  const startTime = Date.now();
  console.log('[API_START] GET /api/workers/dashboard/stats');
  try {
    const workerId = req.user.id;

    const worker = await Worker.findById(workerId).lean();

    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker not found' });
    }

    const [
      earningStats,
      activeJobsCount,
      activeProjectsCount,
      completedJobsCount,
      ratingStats,
      recentJobs
    ] = await Promise.all([
      Booking.aggregate([
        { $match: { workerId: worker._id, status: { $in: [BOOKING_STATUS.COMPLETED, BOOKING_STATUS.WORK_DONE] } } },
        { $group: { _id: null, total: { $sum: "$finalAmount" } } }
      ]),
      Booking.countDocuments({
        workerId: worker._id,
        status: {
          $in: [
            BOOKING_STATUS.ASSIGNED, BOOKING_STATUS.VISITED, BOOKING_STATUS.IN_PROGRESS,
            BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.WORKER_ASSIGNED, BOOKING_STATUS.ACCEPTED,
            BOOKING_STATUS.JOURNEY_STARTED
          ]
        }
      }),
      WorkerProject.countDocuments({
        workerId: worker._id,
        status: { $in: ['PENDING', 'IN_PROGRESS'] }
      }),
      Booking.countDocuments({
        workerId: worker._id,
        status: { $in: [BOOKING_STATUS.COMPLETED, BOOKING_STATUS.WORK_DONE] }
      }),
      Booking.aggregate([
        { $match: { workerId: worker._id, rating: { $exists: true, $ne: null } } },
        { $group: { _id: null, avgRating: { $avg: "$rating" } } }
      ]),
      Booking.find({ workerId: worker._id })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('userId', 'name')
        .populate('serviceId', 'title categoryIcon')
        .lean()
    ]);

    const totalEarnings = earningStats.length > 0 ? earningStats[0].total : 0;
    const averageRating = ratingStats.length > 0 ? parseFloat(ratingStats[0].avgRating.toFixed(1)) : (worker.rating || 0);

    const timeTaken = Date.now() - startTime;
    console.log(`[API_SUCCESS] GET /api/workers/dashboard/stats - ${timeTaken}ms`);

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
    console.error(`[API_ERROR] GET /api/workers/dashboard/stats - ${Date.now() - startTime}ms :`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics'
    });
  }
};

module.exports = {
  getDashboardStats
};
