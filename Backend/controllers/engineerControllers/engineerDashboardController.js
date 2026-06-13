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
  try {
    const engineerId = req.user.id;

    const engineer = await Engineer.findById(engineerId);

    if (!engineer) {
      return res.status(404).json({
        success: false,
        message: 'Engineer not found'
      });
    }

    // 2. Calculate Total Earnings
    // Hardware earnings
    const hardwareEarningStats = await Booking.aggregate([
      {
        $match: {
          engineerId: engineer._id,
          status: { $in: [BOOKING_STATUS.COMPLETED, BOOKING_STATUS.WORK_DONE] }
        }
      },
      {
        $group: { _id: null, total: { $sum: "$finalAmount" } }
      }
    ]);
    const hardwareEarnings = hardwareEarningStats.length > 0 ? hardwareEarningStats[0].total : 0;

    // Digital earnings
    const digitalEarningStats = await DigitalAssignment.aggregate([
      { $match: { engineerId: engineer._id, status: 'Completed' } },
      { $group: { _id: null, total: { $sum: "$earnings" } } }
    ]);
    const digitalEarnings = digitalEarningStats.length > 0 ? digitalEarningStats[0].total : 0;

    const totalEarnings = hardwareEarnings + digitalEarnings;

    // 3. Count Active Jobs
    const hardwareActiveJobsCount = await Booking.countDocuments({
      engineerId: engineer._id,
      status: { $in: [BOOKING_STATUS.ASSIGNED, BOOKING_STATUS.VISITED, BOOKING_STATUS.IN_PROGRESS, BOOKING_STATUS.CONFIRMED] }
    });

    const digitalActiveJobsCount = await DigitalJob.countDocuments({
      assignedEngineer: engineer._id,
      status: { $in: ['Assigned', 'In Progress'] }
    });

    const activeJobsCount = hardwareActiveJobsCount + digitalActiveJobsCount;

    // 4. Count Active Projects
    const hardwareActiveProjectsCount = await WorkerProject.countDocuments({
      engineerId: engineer._id,
      status: { $in: ['PENDING', 'IN_PROGRESS'] }
    });

    const digitalActiveProjectsCount = await DigitalAssignment.countDocuments({
      engineerId: engineer._id,
      status: 'Active'
    });

    const activeProjectsCount = hardwareActiveProjectsCount + digitalActiveProjectsCount;

    // 5. Count Completed Jobs
    const completedHardwareCount = await Booking.countDocuments({
      engineerId: engineer._id,
      status: { $in: [BOOKING_STATUS.COMPLETED, BOOKING_STATUS.WORK_DONE] }
    });

    const completedDigitalCount = await DigitalJob.countDocuments({
      assignedEngineer: engineer._id,
      status: 'Completed'
    });

    const completedJobsCount = completedHardwareCount + completedDigitalCount;

    // 6. Calculate Average Rating (Hardware only for now or fallback)
    const ratingStats = await Booking.aggregate([
      { $match: { engineerId: engineer._id, rating: { $exists: true, $ne: null } } },
      { $group: { _id: null, avgRating: { $avg: "$rating" } } }
    ]);

    const averageRating = ratingStats.length > 0 ? parseFloat(ratingStats[0].avgRating.toFixed(1)) : (engineer.rating || 0);

    // 7. Get Recent Jobs (Hardware + Digital)
    const recentHardwareJobs = await Booking.find({ engineerId: engineer._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('userId', 'name')
      .populate('serviceId', 'title categoryIcon');
      
    const recentDigitalJobs = await DigitalJob.find({ assignedEngineer: engineer._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('vendorId', 'companyName');

    // Combine and sort
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
