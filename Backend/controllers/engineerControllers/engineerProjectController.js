const WorkerProject = require('../../models/WorkerProject');

/**
 * Get project counts by status for the authenticated engineer
 */
const getProjectCounts = async (req, res) => {
  try {
    const engineerId = req.user.id;

    const [all, inProgress, onHold, completed] = await Promise.all([
      WorkerProject.countDocuments({ engineerId }),
      WorkerProject.countDocuments({ engineerId, status: 'In Progress' }),
      WorkerProject.countDocuments({ engineerId, status: 'On Hold' }),
      WorkerProject.countDocuments({ engineerId, status: 'Completed' })
    ]);

    res.status(200).json({
      success: true,
      data: {
        All: all,
        'In Progress': inProgress,
        'On Hold': onHold,
        'Completed': completed
      }
    });
  } catch (error) {
    console.error('Error fetching project counts:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch project counts' });
  }
};

/**
 * Get list of projects for the authenticated engineer
 */
const getProjects = async (req, res) => {
  try {
    const engineerId = req.user.id;
    const { status, page = 1, limit = 10 } = req.query;

    const query = { engineerId };
    if (status && status !== 'All') {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [projects, total] = await Promise.all([
      WorkerProject.find(query)
        .populate('clientId', 'name companyName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      WorkerProject.countDocuments(query)
    ]);

    // Format response to match frontend requirements
    const formattedProjects = projects.map(p => {
      // Find next pending milestone
      const nextMilestone = p.milestones?.find(m => m.status === 'Pending')?.title || 'No pending milestones';
      
      return {
        projectId: p._id,
        projectName: p.projectName,
        clientName: p.clientId?.companyName || p.clientId?.name || 'Unknown Client',
        projectType: p.projectType,
        status: p.status,
        progress: p.progress,
        nextMilestone: nextMilestone,
        dueDate: p.dueDate,
        assignedDate: p.startDate,
        totalAmount: p.totalAmount,
        paidAmount: p.paidAmount
      };
    });

    res.status(200).json({
      success: true,
      data: formattedProjects,
      pagination: {
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total
      }
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch projects' });
  }
};

/**
 * Get detailed project information by ID
 */
const getProjectById = async (req, res) => {
  try {
    const engineerId = req.user.id;
    const { projectId } = req.params;

    const project = await WorkerProject.findOne({ _id: projectId, engineerId })
      .populate('clientId', 'name companyName phone email address')
      .populate('vendorId', 'name companyName profilePic')
      .populate('engineerId', 'name profilePic')
      .populate('adminSupervisor', 'name profilePic');

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    res.status(200).json({
      success: true,
      data: project
    });
  } catch (error) {
    console.error('Error fetching project details:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch project details' });
  }
};

/**
 * Get project documents
 */
const getProjectDocuments = async (req, res) => {
  try {
    const engineerId = req.user.id;
    const { projectId } = req.params;

    const project = await WorkerProject.findOne({ _id: projectId, engineerId }).select('documents');
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    res.status(200).json({ success: true, data: project.documents });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch documents' });
  }
};

/**
 * Get project payments
 */
const getProjectPayments = async (req, res) => {
  try {
    const engineerId = req.user.id;
    const { projectId } = req.params;

    const project = await WorkerProject.findOne({ _id: projectId, engineerId }).select('payments totalAmount paidAmount');
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    res.status(200).json({ success: true, data: { payments: project.payments, totalAmount: project.totalAmount, paidAmount: project.paidAmount } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch payments' });
  }
};

/**
 * Get project timeline
 */
const getProjectTimeline = async (req, res) => {
  try {
    const engineerId = req.user.id;
    const { projectId } = req.params;

    const project = await WorkerProject.findOne({ _id: projectId, engineerId }).select('timeline');
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    res.status(200).json({ success: true, data: project.timeline });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch timeline' });
  }
};

/**
 * Get project milestones
 */
const getProjectMilestones = async (req, res) => {
  try {
    const engineerId = req.user.id;
    const { projectId } = req.params;

    const project = await WorkerProject.findOne({ _id: projectId, engineerId })
      .select('projectName clientId milestones progress status')
      .populate('clientId', 'name companyName');
      
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    res.status(200).json({ 
      success: true, 
      data: {
        projectInfo: {
          projectName: project.projectName,
          projectId: project._id,
          clientName: project.clientId?.companyName || project.clientId?.name || 'Unknown Client',
          progress: project.progress,
          status: project.status,
          totalMilestones: project.milestones.length,
          completedMilestones: project.milestones.filter(m => m.status === 'Completed').length
        },
        milestones: project.milestones 
      }
    });
  } catch (error) {
    console.error('Error fetching milestones:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch milestones' });
  }
};

/**
 * Get project progress stats
 */
const getProjectProgress = async (req, res) => {
  try {
    const engineerId = req.user.id;
    const { projectId } = req.params;

    const project = await WorkerProject.findOne({ _id: projectId, engineerId }).select('progress milestones');
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    const totalMilestones = project.milestones.length;
    const completedMilestones = project.milestones.filter(m => m.status === 'Completed').length;

    res.status(200).json({ 
      success: true, 
      data: {
        progress: project.progress,
        totalMilestones,
        completedMilestones
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch progress' });
  }
};

/**
 * Submit milestone
 */
const submitMilestone = async (req, res) => {
  try {
    const engineerId = req.user.id;
    const { projectId, milestoneId } = req.params;
    const { notes, attachments, workDescription } = req.body;

    const project = await WorkerProject.findOne({ _id: projectId, engineerId });
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    const milestone = project.milestones.id(milestoneId);
    if (!milestone) return res.status(404).json({ success: false, message: 'Milestone not found' });

    if (milestone.status === 'Completed' || milestone.status === 'Approved') {
      return res.status(400).json({ success: false, message: 'Milestone is already approved or completed' });
    }

    if (!['Pending', 'In Progress', 'Rejected'].includes(milestone.status)) {
      return res.status(400).json({ success: false, message: 'Milestone cannot be submitted in its current state' });
    }

    // Update milestone
    milestone.status = 'Submitted';
    milestone.submittedAt = new Date();
    
    if (workDescription) milestone.workDescription = workDescription;
    if (notes) milestone.notes = notes;
    if (attachments && attachments.length > 0) {
      milestone.attachments = [...(milestone.attachments || []), ...attachments];
    }
    
    // Add to timeline
    project.timeline.push({
      event: 'Milestone Submitted',
      description: `Engineer submitted milestone: ${milestone.title}`
    });

    await project.save();

    // Trigger socket event
    const io = req.app.get('io');
    if (io) {
      io.to(`project_${projectId}`).emit('milestone_updated', {
        projectId,
        milestoneId,
        status: 'Submitted',
        message: `Milestone "${milestone.title}" was submitted for review.`
      });
    }

    res.status(200).json({ success: true, message: 'Milestone submitted successfully', data: milestone });
  } catch (error) {
    console.error('Error submitting milestone:', error);
    res.status(500).json({ success: false, message: 'Failed to submit milestone' });
  }
};

/**
 * Get milestone review status
 */
const getMilestoneReviewStatus = async (req, res) => {
  try {
    const engineerId = req.user.id;
    const { projectId, milestoneId } = req.params;

    const project = await WorkerProject.findOne({ _id: projectId, engineerId })
      .populate('vendorId', 'name companyName')
      .populate('adminSupervisor', 'name');

    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    const milestone = project.milestones.id(milestoneId);
    if (!milestone) return res.status(404).json({ success: false, message: 'Milestone not found' });

    let reviewerName = 'Vendor/Admin';
    if (project.vendorId) {
      reviewerName = project.vendorId.companyName || project.vendorId.name;
    } else if (project.adminSupervisor) {
      reviewerName = project.adminSupervisor.name;
    }

    res.status(200).json({
      success: true,
      data: {
        project: {
          id: project._id,
          name: project.projectName
        },
        milestone: {
          id: milestone._id,
          title: milestone.title,
          status: milestone.status,
          submittedAt: milestone.submittedAt || milestone.updatedAt,
          assignedDate: milestone.assignedDate
        },
        reviewer: reviewerName,
        expectedReviewTime: '24-48 Hours'
      }
    });
  } catch (error) {
    console.error('Error fetching review status:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch review status' });
  }
};

/**
 * Get specific milestone details
 */
const getMilestoneById = async (req, res) => {
  try {
    const engineerId = req.user.id;
    const { projectId, milestoneId } = req.params;

    const project = await WorkerProject.findOne({ _id: projectId, engineerId }).select('milestones');
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    const milestone = project.milestones.id(milestoneId);
    if (!milestone) return res.status(404).json({ success: false, message: 'Milestone not found' });

    res.status(200).json({ success: true, data: milestone });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch milestone details' });
  }
};

module.exports = {
  getProjectCounts,
  getProjects,
  getProjectById,
  getProjectDocuments,
  getProjectPayments,
  getProjectTimeline,
  getProjectMilestones,
  getProjectProgress,
  submitMilestone,
  getMilestoneReviewStatus,
  getMilestoneById
};
