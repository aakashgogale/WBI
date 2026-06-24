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

    // Retrieve dynamic verification configurations for engineers
    const VerificationConfig = require('../models/VerificationConfig');
    const VerificationDocument = require('../models/VerificationDocument');

    const config = await VerificationConfig.findOne({ roleType: 'engineer' });
    const requiredDocs = config?.requiredDocuments || ['aadhaar', 'pan'];

    const rawEngineers = await Engineer.find({ vendorId, isActive: true, approvalStatus: 'approved' });
    const engineers = [];

    for (const eng of rawEngineers) {
      const verifiedDocsCount = await VerificationDocument.countDocuments({
        ownerId: eng._id,
        documentType: { $in: requiredDocs },
        status: 'verified'
      });
      if (verifiedDocsCount >= requiredDocs.length) {
        engineers.push(eng);
      }
    }

    if (engineers.length === 0) {
      console.log('No verified engineers available');
      return { success: false, message: 'No verified engineers available' };
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
