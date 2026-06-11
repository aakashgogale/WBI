const WorkOrder = require('../../models/WorkOrder');
const Engineer = require('../../models/Engineer');
const { getIO } = require('../../sockets');
const { engineerAssignmentQueue } = require('../../jobs/queueSetup');

// Fetch ranked engineers for a specific work order (Manual Mode support)
exports.getRankedEngineers = async (req, res) => {
  try {
    const { workOrderId } = req.params;
    const vendorId = req.user._id;

    const workOrder = await WorkOrder.findOne({ _id: workOrderId, vendorId }).populate('subServiceId');
    if (!workOrder) {
      return res.status(404).json({ success: false, message: 'Work order not found' });
    }

    // Basic mock ranking logic
    const engineers = await Engineer.find({ vendorId, isActive: true });
    
    // In a real system, calculate score based on:
    // 1. Skill tags (40 pts)
    // 2. Distance from site (30 pts)
    // 3. Avg rating (20 pts)
    // 4. Current active jobs count (10 pts)
    const rankedEngineers = engineers.map(eng => ({
      engineer: eng,
      score: Math.floor(Math.random() * 100) // Mock score
    })).sort((a, b) => b.score - a.score);

    res.status(200).json({ success: true, data: rankedEngineers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Manual Assignment
exports.assignEngineer = async (req, res) => {
  try {
    const { workOrderId } = req.params;
    const { engineerId } = req.body;
    const vendorId = req.user._id;

    const workOrder = await WorkOrder.findOne({ _id: workOrderId, vendorId });
    if (!workOrder) {
      return res.status(404).json({ success: false, message: 'Work order not found' });
    }

    const engineer = await Engineer.findOne({ _id: engineerId, vendorId });
    if (!engineer) {
      return res.status(404).json({ success: false, message: 'Engineer not found or belongs to another vendor' });
    }

    workOrder.engineerId = engineerId;
    workOrder.status = 'engineer_assigned';
    workOrder.timeline.push({ status: 'engineer_assigned', timestamp: new Date() });
    await workOrder.save();

    // Notify Engineer
    const io = getIO();
    io.to(`engineer:${engineerId}`).emit('job:engineer_assigned', {
      workOrderId: workOrder._id,
      clientName: workOrder.userId.name // Needs proper population in a real scenario
    });

    // Notify Client
    io.to(`client:${workOrder.userId}`).emit('job:engineer_assigned', {
      workOrderId: workOrder._id,
      engineerName: engineer.name
    });

    res.status(200).json({ success: true, message: 'Engineer assigned manually', data: workOrder });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Auto Assignment Trigger
exports.autoAssignEngineer = async (req, res) => {
  try {
    const { workOrderId } = req.params;
    const vendorId = req.user._id;

    const workOrder = await WorkOrder.findOne({ _id: workOrderId, vendorId });
    if (!workOrder) {
      return res.status(404).json({ success: false, message: 'Work order not found' });
    }

    // Dispatch BullMQ job to handle auto assignment
    await engineerAssignmentQueue.add('auto-assign', { workOrderId: workOrder._id, vendorId });

    res.status(200).json({ success: true, message: 'Auto assignment triggered' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
