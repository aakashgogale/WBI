const mongoose = require('mongoose');
const Engineer = require('../../models/Engineer');
const B2BJob = require('../../models/B2BJob');
const B2BEngineerAssignment = require('../../models/B2BEngineerAssignment');
const B2BJobStatusLog = require('../../models/B2BJobStatusLog');
const { WORKER_STATUS } = require('../../utils/constants');

// Helper to get distinct engineer IDs assigned to a company's jobs
const getCompanyEngineerIds = async (companyId) => {
  const jobEngineers = await B2BJob.distinct('assignedTo', { companyId, assignedTo: { $ne: null } });
  const assignmentEngineers = await B2BEngineerAssignment.distinct('engineerId', { companyId });
  
  // Merge and deduplicate
  const allIds = [...jobEngineers, ...assignmentEngineers].map(id => id.toString());
  return [...new Set(allIds)].map(id => new mongoose.Types.ObjectId(id));
};

/**
 * GET Stats (KPIs)
 */
const getStats = async (req, res) => {
  try {
    const engineerIds = await getCompanyEngineerIds(req.user.id);
    
    const statsPipeline = [
      { $match: { _id: { $in: engineerIds } } },
      {
        $facet: {
          total: [{ $count: 'count' }],
          available: [{ $match: { status: WORKER_STATUS.AVAILABLE } }, { $count: 'count' }],
          busy: [{ $match: { status: { $in: [WORKER_STATUS.ON_THE_WAY, WORKER_STATUS.IN_PROGRESS, WORKER_STATUS.ASSIGNED] } } }, { $count: 'count' }],
          onJob: [{ $match: { status: { $in: [WORKER_STATUS.ON_THE_WAY, WORKER_STATUS.IN_PROGRESS] } } }, { $count: 'count' }],
          offline: [{ $match: { status: WORKER_STATUS.OFFLINE } }, { $count: 'count' }],
          onLeave: [{ $match: { status: WORKER_STATUS.SUSPENDED } }, { $count: 'count' }], // Approximate mapping for on leave
          avgRating: [{ $group: { _id: null, avg: { $avg: '$rating' } } }]
        }
      }
    ];

    const result = await Engineer.aggregate(statsPipeline);
    const data = result[0] || {};

    const extractCount = (arr) => (arr && arr.length > 0 ? arr[0].count : 0);
    const extractAvg = (arr) => (arr && arr.length > 0 ? Number(arr[0].avg.toFixed(1)) : 0);

    const stats = {
      totalEngineers: extractCount(data.total),
      available: extractCount(data.available),
      busy: extractCount(data.busy),
      onJob: extractCount(data.onJob),
      offline: extractCount(data.offline),
      onLeave: extractCount(data.onLeave),
      averageRating: extractAvg(data.avgRating)
    };

    return res.status(200).json({ success: true, stats });
  } catch (error) {
    console.error('[MyEngineers getStats]', error);
    return res.status(500).json({ success: false, message: 'Server error fetching stats' });
  }
};

/**
 * GET Engineers List
 */
const getEngineers = async (req, res) => {
  try {
    const engineerIds = await getCompanyEngineerIds(req.user.id);
    
    const { 
      page = 1, limit = 10, search, status, skill, city, rating, experience
    } = req.query;

    const filter = { _id: { $in: engineerIds } };

    if (search) {
      const searchRegex = { $regex: search, $options: 'i' };
      filter.$or = [
        { name: searchRegex },
        { phone: searchRegex },
        { 'engineerDetails.qualification': searchRegex }
      ];
    }

    if (status && status !== 'all') {
      if (status === 'Available') filter.status = WORKER_STATUS.AVAILABLE;
      if (status === 'Busy') filter.status = { $in: [WORKER_STATUS.ON_THE_WAY, WORKER_STATUS.IN_PROGRESS, WORKER_STATUS.ASSIGNED] };
      if (status === 'Offline') filter.status = WORKER_STATUS.OFFLINE;
    }
    
    if (skill && skill !== 'all') filter.serviceCategories = { $in: [skill] };
    if (city && city !== 'all') filter['address.city'] = { $regex: city, $options: 'i' };
    if (rating && rating !== 'all') filter.rating = { $gte: parseFloat(rating) };
    if (experience && experience !== 'all') filter.experienceLevel = { $regex: experience, $options: 'i' };

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const [engineers, total] = await Promise.all([
      Engineer.find(filter)
        .select('name phone status rating totalJobs completedJobs address profilePhoto experienceLevel serviceCategories primaryCategory')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Engineer.countDocuments(filter)
    ]);

    // For each engineer, fetch their current active job for this company
    const enrichedEngineers = await Promise.all(engineers.map(async (eng) => {
      const currentJob = await B2BJob.findOne({
        companyId: req.user.id,
        assignedTo: eng._id,
        status: { $in: ['assigned', 'searching_engineer', 'in_progress', 'engineer_on_way'] }
      }).select('jobId service city').lean();

      return {
        ...eng,
        currentJob: currentJob || null,
        lastActive: eng.updatedAt
      };
    }));

    return res.status(200).json({
      success: true,
      data: enrichedEngineers,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('[MyEngineers getEngineers]', error);
    return res.status(500).json({ success: false, message: 'Server error fetching engineers' });
  }
};

/**
 * GET Engineer Details
 */
const getEngineerDetails = async (req, res) => {
  try {
    const engineerIds = await getCompanyEngineerIds(req.user.id);
    const engId = req.params.engineerId;
    
    if (!engineerIds.some(id => id.toString() === engId)) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this engineer' });
    }

    const engineer = await Engineer.findById(engId)
      .select('-password -bankDetails -fcmTokens -fcmTokenMobile')
      .lean();
      
    if (!engineer) return res.status(404).json({ success: false, message: 'Engineer not found' });

    // Fetch current job
    const currentJob = await B2BJob.findOne({
      companyId: req.user.id,
      assignedTo: engId,
      status: { $in: ['assigned', 'in_progress'] }
    }).select('jobId service status city address charge').lean();

    // Fetch jobs completed for this company
    const completedForCompany = await B2BJob.countDocuments({
      companyId: req.user.id,
      assignedTo: engId,
      status: 'completed'
    });

    return res.status(200).json({
      success: true,
      data: {
        ...engineer,
        currentJob,
        b2bCompletedJobs: completedForCompany
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * GET Current Job
 */
const getCurrentJob = async (req, res) => {
  try {
    const currentJob = await B2BJob.findOne({
      companyId: req.user.id,
      assignedTo: req.params.engineerId,
      status: { $in: ['assigned', 'in_progress'] }
    }).lean();
    return res.status(200).json({ success: true, data: currentJob });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * GET Performance
 */
const getPerformance = async (req, res) => {
  try {
    const engineerIds = await getCompanyEngineerIds(req.user.id);
    const engId = req.params.engineerId;
    
    if (!engineerIds.some(id => id.toString() === engId)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Performance specifically for this B2B company's jobs
    const currentMonthStart = new Date();
    currentMonthStart.setDate(1);
    currentMonthStart.setHours(0,0,0,0);

    const jobs = await B2BJob.find({
      companyId: req.user.id,
      assignedTo: engId
    }).lean();

    const completed = jobs.filter(j => j.status === 'completed');
    const failed = jobs.filter(j => j.status === 'failed' || j.status === 'cancelled');
    const completedThisMonth = completed.filter(j => new Date(j.createdAt) >= currentMonthStart);

    // Mock SLAs for UI
    const acceptanceRate = '92%';
    const completionRate = '89%';
    const avgResponseTime = '12 mins';
    
    return res.status(200).json({
      success: true,
      data: {
        totalAssigned: jobs.length,
        completed: completed.length,
        completedThisMonth: completedThisMonth.length,
        failed: failed.length,
        acceptanceRate,
        completionRate,
        avgResponseTime
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * GET Timeline (Recent Activity across their assigned jobs for this company)
 */
const getTimeline = async (req, res) => {
  try {
    const jobs = await B2BJob.find({ companyId: req.user.id, assignedTo: req.params.engineerId }).select('_id jobId').lean();
    const jobIds = jobs.map(j => j._id);
    
    const logs = await B2BJobStatusLog.find({ jobId: { $in: jobIds } })
      .populate('jobId', 'jobId')
      .sort({ timestamp: -1 })
      .limit(20)
      .lean();
      
    return res.status(200).json({ success: true, data: logs });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * GET Live Tracking (Map)
 */
const getLiveTracking = async (req, res) => {
  try {
    const engineerIds = await getCompanyEngineerIds(req.user.id);
    
    // Get live coordinates of engineers who are currently active/busy
    const activeEngineers = await Engineer.find({
      _id: { $in: engineerIds },
      status: { $in: [WORKER_STATUS.ON_THE_WAY, WORKER_STATUS.IN_PROGRESS, WORKER_STATUS.AVAILABLE] },
      location: { $exists: true, $ne: null }
    }).select('name location status').lean();

    return res.status(200).json({ success: true, data: activeEngineers });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * GET Export
 */
const exportEngineers = async (req, res) => {
  try {
    const engineerIds = await getCompanyEngineerIds(req.user.id);
    const engineers = await Engineer.find({ _id: { $in: engineerIds } }).lean();
    
    let csv = 'Engineer ID,Name,Phone,Experience,City,Status,Rating\n';
    engineers.forEach(eng => {
      csv += `${eng._id},"${eng.name}",${eng.phone},"${eng.experienceLevel}","${eng.address?.city || ''}",${eng.status},${eng.rating}\n`;
    });

    res.header('Content-Type', 'text/csv');
    res.attachment(`WBI_Assigned_Engineers_${Date.now()}.csv`);
    return res.send(csv);
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Export failed' });
  }
};

module.exports = {
  getStats,
  getEngineers,
  getEngineerDetails,
  getCurrentJob,
  getPerformance,
  getTimeline,
  getLiveTracking,
  exportEngineers
};
