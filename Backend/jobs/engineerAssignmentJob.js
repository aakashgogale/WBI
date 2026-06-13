const { Worker } = require('bullmq');
const { redisConnection } = require('./queueSetup');
const WorkOrder = require('../models/WorkOrder');
const Engineer = require('../models/Engineer');
const { getIO } = require('../sockets');

const engineerAssignmentWorker = new Worker('engineer-assignment', async (job) => {
  console.log(`[Worker] Processing engineer assignment for work order ${job.data.workOrderId}`);
  try {
    const { workOrderId, vendorId } = job.data;
    
    const workOrder = await WorkOrder.findOne({ _id: workOrderId, vendorId });
    if (!workOrder) throw new Error('Work order not found');

    // Basic scoring
    const engineers = await Engineer.find({ vendorId, isActive: true });
    if (engineers.length === 0) {
      console.log('No engineers available');
      return { success: false, message: 'No engineers available' };
    }

    const rankedEngineers = engineers.map(eng => ({
      engineer: eng,
      score: Math.floor(Math.random() * 100)
    })).sort((a, b) => b.score - a.score);

    const bestEngineer = rankedEngineers[0].engineer;

    workOrder.engineerId = bestEngineer._id;
    workOrder.status = 'engineer_assigned';
    workOrder.timeline.push({ status: 'engineer_assigned', timestamp: new Date() });
    await workOrder.save();

    const io = getIO();
    io.to(`engineer:${bestEngineer._id}`).emit('job:engineer_assigned', {
      workOrderId: workOrder._id
    });

    return { assignedEngineer: bestEngineer._id };
  } catch (error) {
    console.error('[Worker Error] engineerAssignmentWorker:', error);
  }
}, { connection: redisConnection });

engineerAssignmentWorker.on('error', (err) => {
  console.error('[engineerAssignmentWorker] ❌ Redis/Internal Error:', err.message);
});

module.exports = engineerAssignmentWorker;
