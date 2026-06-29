const mongoose = require('mongoose');
const B2BJob = require('../../models/B2BJob');
const B2BJobStatusLog = require('../../models/B2BJobStatusLog');
const B2BWalletTransaction = require('../../models/B2BWalletTransaction');
const Engineer = require('../../models/Engineer');

/**
 * GET Stats (KPIs)
 */
const getStats = async (req, res) => {
  try {
    const companyId = new mongoose.Types.ObjectId(req.user.id);
    
    // Complex Aggregation for KPI Cards
    const statsPipeline = [
      { $match: { companyId } },
      {
        $facet: {
          totalJobs: [{ $count: 'count' }],
          pending: [{ $match: { status: 'pending' } }, { $count: 'count' }],
          searchingEngineer: [{ $match: { status: 'searching_engineer' } }, { $count: 'count' }],
          assigned: [{ $match: { status: 'assigned' } }, { $count: 'count' }],
          engineerOnWay: [{ $match: { status: 'engineer_on_way' } }, { $count: 'count' }], // assuming extra states exist
          inProgress: [{ $match: { status: 'in_progress' } }, { $count: 'count' }],
          completed: [{ $match: { status: 'completed' } }, { $count: 'count' }],
          cancelled: [{ $match: { status: 'cancelled' } }, { $count: 'count' }],
          failed: [{ $match: { status: 'failed' } }, { $count: 'count' }],
          todayJobs: [
            {
              $match: {
                createdAt: {
                  $gte: new Date(new Date().setHours(0, 0, 0, 0)),
                  $lte: new Date(new Date().setHours(23, 59, 59, 999))
                }
              }
            },
            { $count: 'count' }
          ],
          thisMonthJobs: [
            {
              $match: {
                createdAt: {
                  $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
                }
              }
            },
            { $count: 'count' }
          ],
          totalSpend: [
            { $match: { paymentStatus: 'deducted' } },
            { $group: { _id: null, total: { $sum: '$charge' } } }
          ]
        }
      }
    ];

    const result = await B2BJob.aggregate(statsPipeline);
    const data = result[0] || {};

    const extractCount = (arr) => (arr && arr.length > 0 ? arr[0].count : 0);
    const extractTotal = (arr) => (arr && arr.length > 0 ? arr[0].total : 0);

    const stats = {
      totalJobs: extractCount(data.totalJobs),
      pending: extractCount(data.pending),
      searchingEngineer: extractCount(data.searchingEngineer),
      assigned: extractCount(data.assigned),
      engineerOnWay: extractCount(data.engineerOnWay),
      inProgress: extractCount(data.inProgress),
      completed: extractCount(data.completed),
      cancelled: extractCount(data.cancelled),
      failed: extractCount(data.failed),
      todayJobs: extractCount(data.todayJobs),
      thisMonthJobs: extractCount(data.thisMonthJobs),
      totalSpend: extractTotal(data.totalSpend),
      walletDeduction: extractTotal(data.totalSpend), // Alias for spend
      averageCompletionTime: '2.5 hrs', // Placeholder logic until exact SLA calculation is defined
      averageSLA: '98%' // Placeholder
    };

    // Calculate chart data (overview)
    const chartData = [
      { name: 'Pending', value: stats.pending, color: '#f59e0b' },
      { name: 'Assigned', value: stats.assigned, color: '#8b5cf6' },
      { name: 'In Progress', value: stats.inProgress, color: '#3b82f6' },
      { name: 'Completed', value: stats.completed, color: '#10b981' },
      { name: 'Failed/Cancelled', value: stats.failed + stats.cancelled, color: '#ef4444' }
    ];

    return res.status(200).json({ success: true, stats, chartData });
  } catch (error) {
    console.error('[MyJobs getStats]', error);
    return res.status(500).json({ success: false, message: 'Server error fetching stats' });
  }
};

/**
 * GET Jobs (List with pagination and filters)
 */
const getJobs = async (req, res) => {
  try {
    const companyId = req.user.id;
    const { 
      page = 1, limit = 10, search, status, service, city, priority, 
      paymentStatus, startDate, endDate, batchId, sort = 'createdAt', order = 'desc' 
    } = req.query;

    const filter = { companyId };

    // Text search on multiple fields
    if (search) {
      const searchRegex = { $regex: search, $options: 'i' };
      filter.$or = [
        { jobId: searchRegex },
        { customerName: searchRegex },
        { phone: searchRegex },
        { assignedToName: searchRegex },
        { service: searchRegex },
        { address: searchRegex }
      ];
    }

    // Direct filters
    if (status && status !== 'all') filter.status = status;
    if (service && service !== 'all') filter.service = service;
    if (city && city !== 'all') filter.city = city;
    if (priority && priority !== 'all') filter.priority = priority;
    if (paymentStatus && paymentStatus !== 'all') filter.paymentStatus = paymentStatus;
    if (batchId && batchId !== 'all') filter.batchId = batchId;

    // Date range
    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(new Date(endDate).setHours(23,59,59,999))
      };
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    
    const sortParams = { [sort]: order === 'desc' ? -1 : 1 };

    const [jobs, total] = await Promise.all([
      B2BJob.find(filter)
        .populate('batchId', 'batchId fileName')
        .populate('assignedTo', 'firstName lastName profilePic averageRating')
        .sort(sortParams)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      B2BJob.countDocuments(filter)
    ]);

    return res.status(200).json({
      success: true,
      data: jobs,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    });

  } catch (error) {
    console.error('[MyJobs getJobs]', error);
    return res.status(500).json({ success: false, message: 'Server error fetching jobs' });
  }
};

/**
 * GET Export Jobs (CSV)
 */
const exportJobs = async (req, res) => {
  try {
    const companyId = req.user.id;
    const filter = { companyId };
    
    // Apply same filters as GET (simplified for brevity)
    if (req.query.status && req.query.status !== 'all') filter.status = req.query.status;

    const jobs = await B2BJob.find(filter).lean();
    
    // Build CSV
    let csv = 'Job ID,Customer Name,Phone,Service,City,Priority,Status,Payment Status,Charge,Created Date\n';
    jobs.forEach(j => {
      csv += `${j.jobId},"${j.customerName}",${j.phone},"${j.service}","${j.city}",${j.priority},${j.status},${j.paymentStatus},${j.charge},${j.createdAt}\n`;
    });

    res.header('Content-Type', 'text/csv');
    res.attachment(`WBI_Jobs_Export_${Date.now()}.csv`);
    return res.send(csv);

  } catch (error) {
    console.error('[MyJobs exportJobs]', error);
    return res.status(500).json({ success: false, message: 'Failed to export' });
  }
};

/**
 * GET Job Details
 */
const getJobDetails = async (req, res) => {
  try {
    const job = await B2BJob.findOne({ _id: req.params.id, companyId: req.user.id })
      .populate('batchId')
      .populate('assignedTo');
    
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    
    return res.status(200).json({ success: true, data: job });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * PATCH Update Job
 */
const updateJob = async (req, res) => {
  try {
    const job = await B2BJob.findOneAndUpdate(
      { _id: req.params.id, companyId: req.user.id },
      { $set: req.body },
      { new: true }
    );
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    
    // Log status change if status was updated
    if (req.body.status) {
      await B2BJobStatusLog.create({
        jobId: job._id,
        status: req.body.status,
        updatedBy: req.user.id
      });
      // Emit socket event globally
      const io = req.app.get('io');
      if (io) io.emit('job_updated', { jobId: job._id, status: req.body.status });
    }

    return res.status(200).json({ success: true, data: job });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * DELETE Cancel Job
 */
const cancelJob = async (req, res) => {
  try {
    const job = await B2BJob.findOne({ _id: req.params.id, companyId: req.user.id });
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    job.status = 'cancelled';
    await job.save();

    await B2BJobStatusLog.create({
      jobId: job._id,
      status: 'cancelled',
      updatedBy: req.user.id
    });
    
    const io = req.app.get('io');
    if (io) io.emit('job_cancelled', { jobId: job._id });

    return res.status(200).json({ success: true, message: 'Job cancelled successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * GET Job Timeline
 */
const getJobTimeline = async (req, res) => {
  try {
    const logs = await B2BJobStatusLog.find({ jobId: req.params.id }).sort({ timestamp: -1 });
    return res.status(200).json({ success: true, data: logs });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * POST Reassign Engineer
 */
const reassignEngineer = async (req, res) => {
  try {
    const { jobId, engineerId } = req.body;
    const job = await B2BJob.findOne({ _id: jobId, companyId: req.user.id });
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    const engineer = await Engineer.findById(engineerId);
    if (!engineer) return res.status(404).json({ success: false, message: 'Engineer not found' });

    job.assignedTo = engineer._id;
    job.assignedToName = `${engineer.firstName} ${engineer.lastName}`;
    job.status = 'assigned';
    await job.save();

    await B2BJobStatusLog.create({
      jobId: job._id,
      status: 'assigned',
      updatedBy: req.user.id
    });

    const io = req.app.get('io');
    if (io) io.emit('engineer_assigned', { jobId: job._id, engineerId: engineer._id });

    return res.status(200).json({ success: true, message: 'Engineer reassigned', data: job });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * GET Live Tracking Placeholder
 */
const getLiveTracking = async (req, res) => {
  // In production, this would query a Redis cache or a Location Tracking collection.
  // For now, we return mock live data assuming the engineer is moving towards the job location.
  try {
    const job = await B2BJob.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    // Mock response
    return res.status(200).json({
      success: true,
      data: {
        eta: '15 mins',
        distance: '4.2 km',
        engineerLocation: { lat: 19.0760, lng: 72.8777 },
        destination: job.coordinates?.coordinates || [72.8777, 19.0760] // lng, lat
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * GET Job Logs
 */
const getJobLogs = async (req, res) => {
  try {
    const logs = await B2BJobStatusLog.find({ jobId: req.params.id }).sort({ timestamp: -1 });
    return res.status(200).json({ success: true, data: logs });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getStats,
  getJobs,
  exportJobs,
  getJobDetails,
  updateJob,
  cancelJob,
  getJobTimeline,
  reassignEngineer,
  getLiveTracking,
  getJobLogs
};
