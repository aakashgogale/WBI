const DigitalJob = require('../../models/DigitalJob');
const Engineer = require('../../models/Engineer');

// Get jobs assigned to the engineer
exports.getEngineerJobs = async (req, res) => {
  try {
    const engineerId = req.engineer._id || req.worker._id; // Fallback to worker if using same auth middleware
    const { status, page = 1, limit = 10 } = req.query;

    const query = { assignedEngineer: engineerId };
    
    // Map frontend 'new' status to 'Assigned' backend status
    if (status === 'new') {
      query.status = 'Assigned';
      query.assignmentStatus = 'Pending';
    } else if (status) {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [jobs, total] = await Promise.all([
      DigitalJob.find(query)
        .populate('vendorId', 'companyName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      DigitalJob.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      data: jobs,
      pagination: {
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total
      }
    });
  } catch (error) {
    console.error('Error fetching digital jobs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch jobs'
    });
  }
};

// Accept an assigned job
exports.acceptJob = async (req, res) => {
  try {
    const engineerId = req.engineer._id || req.worker._id;
    const { id } = req.params;

    const job = await DigitalJob.findOne({ _id: id, assignedEngineer: engineerId });

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found or not assigned to you' });
    }

    if (job.assignmentStatus !== 'Pending') {
      return res.status(400).json({ success: false, message: 'Job is no longer pending your acceptance' });
    }

    job.assignmentStatus = 'Accepted';
    job.status = 'In Progress';
    job.acceptedAt = Date.now();
    await job.save();

    // Trigger Socket.IO to notify vendor
    const io = req.app.get('io');
    if (io) {
      io.to(job.vendorId.toString()).emit('job_accepted', {
        jobId: job._id,
        engineerId: engineerId,
        message: 'Engineer accepted the job'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Job accepted successfully',
      data: job
    });
  } catch (error) {
    console.error('Error accepting job:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to accept job'
    });
  }
};

// Reject an assigned job
exports.rejectJob = async (req, res) => {
  try {
    const engineerId = req.engineer._id || req.worker._id;
    const { id } = req.params;

    const job = await DigitalJob.findOne({ _id: id, assignedEngineer: engineerId });

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found or not assigned to you' });
    }

    if (job.assignmentStatus !== 'Pending') {
      return res.status(400).json({ success: false, message: 'Job is no longer pending your acceptance' });
    }

    job.assignmentStatus = 'Rejected';
    job.assignedEngineer = null;
    job.status = 'Open';
    await job.save();

    // Trigger Socket.IO to notify vendor
    const io = req.app.get('io');
    if (io) {
      io.to(job.vendorId.toString()).emit('job_rejected', {
        jobId: job._id,
        engineerId: engineerId,
        message: 'Engineer rejected the job'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Job rejected successfully'
    });
  } catch (error) {
    console.error('Error rejecting job:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject job'
    });
  }
};
