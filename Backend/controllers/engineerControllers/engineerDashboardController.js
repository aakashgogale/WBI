const Booking = require('../../models/Booking');
const Engineer = require('../../models/Engineer');
const WorkerProject = require('../../models/WorkerProject');
const DigitalJob = require('../../models/DigitalJob');
const DigitalAssignment = require('../../models/DigitalAssignment');
const { BOOKING_STATUS } = require('../../utils/constants');

/**
 * Get engineer dashboard statistics
 */
const getDashboardStats = async (req, res) => {
  const startTime = Date.now();
  console.log('[API_START] GET /api/engineers/dashboard/stats');
  try {
    const engineerId = req.user.id;
    const engineer = await Engineer.findById(engineerId).lean();

    if (!engineer) {
      return res.status(404).json({ success: false, message: 'Engineer not found' });
    }

    const [
      hardwareEarningStats,
      digitalEarningStats,
      hardwareActiveJobsCount,
      digitalActiveJobsCount,
      hardwareActiveProjectsCount,
      digitalActiveProjectsCount,
      completedHardwareCount,
      completedDigitalCount,
      ratingStats,
      recentHardwareJobs,
      recentDigitalJobs
    ] = await Promise.all([
      Booking.aggregate([
        { $match: { workerId: engineer._id, status: { $in: [BOOKING_STATUS.COMPLETED, BOOKING_STATUS.WORK_DONE] } } },
        { $group: { _id: null, total: { $sum: "$finalAmount" } } }
      ]),
      DigitalAssignment.aggregate([
        { $match: { engineerId: engineer._id, status: 'Completed' } },
        { $group: { _id: null, total: { $sum: "$earnings" } } }
      ]),
      Booking.countDocuments({
        workerId: engineer._id,
        status: { $in: [BOOKING_STATUS.ASSIGNED, BOOKING_STATUS.VISITED, BOOKING_STATUS.IN_PROGRESS, BOOKING_STATUS.CONFIRMED] }
      }),
      DigitalJob.countDocuments({
        assignedEngineer: engineer._id,
        status: { $in: ['Assigned', 'In Progress'] }
      }),
      WorkerProject.countDocuments({
        workerId: engineer._id,
        status: { $in: ['PENDING', 'IN_PROGRESS'] }
      }),
      DigitalAssignment.countDocuments({
        engineerId: engineer._id,
        status: 'Active'
      }),
      Booking.countDocuments({
        workerId: engineer._id,
        status: { $in: [BOOKING_STATUS.COMPLETED, BOOKING_STATUS.WORK_DONE] }
      }),
      DigitalJob.countDocuments({
        assignedEngineer: engineer._id,
        status: 'Completed'
      }),
      Booking.aggregate([
        { $match: { workerId: engineer._id, rating: { $exists: true, $ne: null } } },
        { $group: { _id: null, avgRating: { $avg: "$rating" } } }
      ]),
      Booking.find({ workerId: engineer._id })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('userId', 'name')
        .populate('serviceId', 'title categoryIcon')
        .lean(),
      DigitalJob.find({ assignedEngineer: engineer._id })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('vendorId', 'companyName')
        .lean()
    ]);

    const hardwareEarnings = hardwareEarningStats.length > 0 ? hardwareEarningStats[0].total : 0;
    const digitalEarnings = digitalEarningStats.length > 0 ? digitalEarningStats[0].total : 0;
    const totalEarnings = hardwareEarnings + digitalEarnings;
    const activeJobsCount = hardwareActiveJobsCount + digitalActiveJobsCount;
    const activeProjectsCount = hardwareActiveProjectsCount + digitalActiveProjectsCount;
    const completedJobsCount = completedHardwareCount + completedDigitalCount;
    const averageRating = ratingStats.length > 0 ? parseFloat(ratingStats[0].avgRating.toFixed(1)) : (engineer.rating || 0);

    const allRecentJobs = [...recentHardwareJobs, ...recentDigitalJobs.map(job => ({
      _id: job._id,
      serviceCategory: job.serviceType,
      serviceId: { name: job.title },
      address: { city: job.clientName },
      basePrice: job.budget?.min || 0,
      finalAmount: job.budget?.max || 0,
      scheduledDate: job.createdAt,
      status: job.status === 'Assigned' && job.assignmentStatus === 'Pending' ? 'NEW' : job.status,
      isDigital: true
    }))].sort((a, b) => new Date(b.createdAt || b.scheduledDate) - new Date(a.createdAt || a.scheduledDate)).slice(0, 5);

    const timeTaken = Date.now() - startTime;
    console.log(`[API_SUCCESS] GET /api/engineers/dashboard/stats - ${timeTaken}ms`);

    res.status(200).json({
      success: true,
      data: {
        totalEarnings,
        activeJobs: activeJobsCount,
        activeProjects: activeProjectsCount,
        completedJobs: completedJobsCount,
        rating: averageRating,
        recentJobs: allRecentJobs
      }
    });

  } catch (error) {
    console.error(`[API_ERROR] GET /api/engineers/dashboard/stats - ${Date.now() - startTime}ms :`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics'
    });
  }
};

module.exports = {
  getDashboardStats
};
