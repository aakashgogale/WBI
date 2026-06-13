const DigitalProject = require('../../models/DigitalProject');
const DigitalAssignment = require('../../models/DigitalAssignment');
const DigitalMilestone = require('../../models/DigitalMilestone');

// Get projects assigned to the engineer
exports.getEngineerProjects = async (req, res) => {
  try {
    const engineerId = req.engineer._id || req.worker._id;
    const { status } = req.query;

    const query = { engineerId };
    if (status) {
      query.status = status;
    }

    // Get assignments
    const assignments = await DigitalAssignment.find(query)
      .populate({
        path: 'projectId',
        populate: { path: 'vendorId', select: 'companyName' }
      })
      .sort({ createdAt: -1 });

    // Extract the actual projects from the assignments
    const projects = assignments.map(a => ({
      ...a.projectId.toObject(),
      assignmentRole: a.role,
      assignmentStatus: a.status
    }));

    res.status(200).json({
      success: true,
      data: projects
    });
  } catch (error) {
    console.error('Error fetching digital projects:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch projects'
    });
  }
};

// Get milestones for a specific project
exports.getProjectMilestones = async (req, res) => {
  try {
    const { projectId } = req.params;
    
    const milestones = await DigitalMilestone.find({ projectId }).sort({ dueDate: 1 });

    res.status(200).json({
      success: true,
      data: milestones
    });
  } catch (error) {
    console.error('Error fetching milestones:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch milestones'
    });
  }
};
