const DigitalJob = require('../../models/DigitalJob');
const Engineer = require('../../models/Engineer');

// Create a digital job and assign it to an engineer
exports.assignJobToEngineer = async (req, res) => {
  try {
    const vendorId = req.vendor._id || req.user.id;
    const { title, clientName, serviceType, description, budget, duration, priority, workType, requiredSkills, assignedEngineer } = req.body;

    const engineer = await Engineer.findById(assignedEngineer);
    if (!engineer) {
      return res.status(404).json({ success: false, message: 'Engineer not found' });
    }

    const job = new DigitalJob({
      title,
      vendorId,
      clientName,
      serviceType,
      description,
      budget,
      duration,
      priority,
      workType,
      requiredSkills,
      status: 'Assigned',
      assignedEngineer,
      assignmentStatus: 'Pending'
    });

    await job.save();

    // Emit Socket.IO event to the specific engineer
    const io = req.app.get('io');
    if (io) {
      io.to(assignedEngineer.toString()).emit('new_digital_job', {
        jobId: job._id,
        title: job.title,
        vendorName: req.vendor?.companyName || 'Vendor',
        budget: job.budget,
        duration: job.duration,
        priority: job.priority,
        message: 'You have a new job assignment waiting.'
      });
    }

    res.status(201).json({
      success: true,
      message: 'Job successfully created and assigned to engineer',
      data: job
    });

  } catch (error) {
    console.error('Error assigning digital job:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign job'
    });
  }
};
