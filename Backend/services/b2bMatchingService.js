const { Queue, Worker: BullWorker } = require('bullmq');
const IORedis = require('ioredis');
const mongoose = require('mongoose');

const B2BJob = require('../models/B2BJob');
const Worker = require('../models/Worker');
const JobHistory = require('../models/JobHistory');
const { getIO } = require('../sockets');

// Initialize Redis connection
const redisOptions = { 
  maxRetriesPerRequest: null,
  retryStrategy: times => Math.min(times * 200, 5000)
};
const connection = new IORedis(process.env.REDIS_URL || 'redis://127.0.0.1:6379', redisOptions);

// Create the Matching Queue
const b2bMatchingQueue = new Queue('b2b-matching-queue', { connection });

connection.on('error', (err) => {
  console.error('[Redis Error in b2bMatchingService]', err.message);
});

b2bMatchingQueue.on('error', (err) => {
  console.error('[Queue Error in b2bMatchingQueue]', err.message);
});

let matchingWorker;

// Helper to emit socket events
const emitSocket = (room, event, data) => {
  try {
    const io = getIO();
    if (io) {
      io.to(room).emit(event, data);
    }
  } catch (err) {
    console.warn('[Socket Warning] Could not emit matching event:', err.message);
  }
};

/**
 * Queue a B2B Job matching task
 */
const queueJobMatching = async (jobId, app) => {
  await b2bMatchingQueue.add('findEngineer', { jobId }, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 1000 }
  });
  console.log(`[Matching] Queued matching for B2B Job: ${jobId}`);
};

/**
 * Initialize the matching BullMQ worker
 */
const initMatchingWorker = (app) => {
  if (matchingWorker) return matchingWorker;

  matchingWorker = new BullWorker(
    'b2b-matching-queue',
    async (job) => {
      const { jobId } = job.data;
      console.log(`[Matching Worker] Resolving engineer for B2B Job: ${jobId}`);

      try {
        const b2bJob = await B2BJob.findById(jobId);
        if (!b2bJob) {
          console.error(`[Matching Worker] Job ${jobId} not found`);
          return;
        }

        // Only search if the job is searching or pending
        if (!['pending', 'searching_engineer'].includes(b2bJob.status)) {
          console.log(`[Matching Worker] Job ${b2bJob.jobId} is in status ${b2bJob.status}. Skipping.`);
          return;
        }

        b2bJob.status = 'searching_engineer';
        await b2bJob.save();

        await JobHistory.create({
          jobId: b2bJob._id,
          status: 'searching_engineer',
          remark: 'Auto-allocation search matching algorithm started.',
          role: 'system'
        });

        // Coordinates lookup [lng, lat]
        const coords = b2bJob.coordinates?.coordinates;
        if (!coords || coords.length !== 2 || coords[0] === 0 || coords[1] === 0) {
          console.warn(`[Matching Worker] Job ${b2bJob.jobId} has invalid coordinates. Cannot perform sphere search.`);
          await handleMatchingFailure(b2bJob, 'Invalid job coordinates');
          return;
        }

        const [lng, lat] = coords;

        // 1. Search online engineers within 30km radius using MongoDB $nearSphere on Worker collection
        const radiusMeters = 30 * 1000;
        const matchingEngineers = await Worker.find({
          roleType: { $in: ['Engineer', 'Both'] },
          status: 'ONLINE',
          approvalStatus: 'approved',
          isActive: true,
          location: {
            $nearSphere: {
              $geometry: {
                type: 'Point',
                coordinates: [lng, lat]
              },
              $maxDistance: radiusMeters
            }
          }
        }).limit(10); // Find top 10 closest

        console.log(`[Matching Worker] Found ${matchingEngineers.length} online engineers near Job ${b2bJob.jobId}`);

        if (matchingEngineers.length === 0) {
          // Try to look for any active (even offline) engineers as secondary fallback
          const fallbackEngineers = await Worker.find({
            roleType: { $in: ['Engineer', 'Both'] },
            approvalStatus: 'approved',
            isActive: true,
            location: {
              $nearSphere: {
                $geometry: {
                  type: 'Point',
                  coordinates: [lng, lat]
                },
                $maxDistance: radiusMeters
              }
            }
          }).limit(5);

          if (fallbackEngineers.length === 0) {
            await handleMatchingFailure(b2bJob, 'No matching engineers found within 30km');
            return;
          }

          // Use the closest offline fallback engineer (direct assignment to maintain dispatch SLA)
          await assignJobToEngineer(b2bJob, fallbackEngineers[0]);
          return;
        }

        // 2. Real-Time Allocation Flow:
        // In a live environment, we invite engineers sequentially.
        // For production robustness, we will assign the closest online engineer directly and broadcast the accept event.
        const targetEngineer = matchingEngineers[0];
        await assignJobToEngineer(b2bJob, targetEngineer);

      } catch (error) {
        console.error(`[Matching Worker] Failure for job ${jobId}:`, error);
        throw error;
      }
    },
    { connection }
  );

  matchingWorker.on('completed', (job) => {
    console.log(`[Matching Worker] Job ${job.id} completed successfully`);
  });

  matchingWorker.on('failed', (job, err) => {
    console.error(`[Matching Worker] Job ${job.id} failed:`, err.message);
  });

  matchingWorker.on('error', (err) => {
    console.error('[Matching Worker] Critical Error:', err.message);
  });

  return matchingWorker;
};

/**
 * Assign a B2B job to a specific engineer
 */
const assignJobToEngineer = async (b2bJob, engineer) => {
  b2bJob.status = 'assigned';
  b2bJob.assignedTo = engineer._id;
  b2bJob.assignedToName = engineer.name;
  await b2bJob.save();

  // Log in history
  await JobHistory.create({
    jobId: b2bJob._id,
    status: 'assigned',
    remark: `Job allocated to Engineer: ${engineer.name} (Phone: ${engineer.phone})`,
    role: 'system'
  });

  // Socket notification to B2B Company
  emitSocket(`b2b:${b2bJob.companyId.toString()}`, 'b2b:jobAssigned', {
    jobId: b2bJob.jobId,
    engineerName: engineer.name,
    engineerPhone: engineer.phone
  });

  // Socket notification to the specific engineer
  emitSocket(`worker:${engineer._id.toString()}`, 'engineer:jobAssigned', {
    jobId: b2bJob.jobId,
    customerName: b2bJob.customerName,
    address: b2bJob.address,
    preferredDate: b2bJob.preferredDate
  });

  console.log(`[Matching] Successfully allocated Job ${b2bJob.jobId} to Engineer ${engineer.name}`);
};

/**
 * Handle validation or matching failures
 */
const handleMatchingFailure = async (b2bJob, reason) => {
  b2bJob.status = 'failed';
  await b2bJob.save();

  await JobHistory.create({
    jobId: b2bJob._id,
    status: 'failed',
    remark: `Engineer allocation failed: ${reason}. Admin intervention required.`,
    role: 'system'
  });

  // Emit failure to admin
  emitSocket('admin', 'admin:matchingFailed', {
    jobId: b2bJob.jobId,
    companyId: b2bJob.companyId,
    reason
  });

  // Notify company
  emitSocket(`b2b:${b2bJob.companyId.toString()}`, 'b2b:jobFailed', {
    jobId: b2bJob.jobId,
    reason
  });

  console.warn(`[Matching] Allocation failed for Job ${b2bJob.jobId}. Reason: ${reason}`);
};

module.exports = {
  queueJobMatching,
  initMatchingWorker
};
