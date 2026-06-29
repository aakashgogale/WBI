const { Queue, Worker: BullWorker } = require('bullmq');
const IORedis = require('ioredis');
const mongoose = require('mongoose');

// Initialize Redis connection for BullMQ
const redisOptions = { 
  maxRetriesPerRequest: null,
  retryStrategy: times => Math.min(times * 200, 5000)
};
const connection = new IORedis(process.env.REDIS_URL || 'redis://127.0.0.1:6379', redisOptions);

connection.on('error', (err) => {
  console.error('[Redis Error in b2bBulkJobQueueService]', err);
});

// Create the BullMQ Queue
const bulkJobQueue = new Queue('b2b-bulk-job-queue', { connection });

// Initialize Worker in the background
let worker;

const initBulkJobWorker = (app) => {
  if (worker) return worker;

  const b2bBulkJobService = require('./b2bBulkJobService');

  worker = new BullWorker(
    'b2b-bulk-job-queue',
    async (job) => {
      const { batchId } = job.data;
      console.log(`[BullMQ Worker] Processing job '${job.name}' for Batch: ${batchId}`);

      try {
        if (job.name === 'validateBatch') {
          await b2bBulkJobService.processValidation(batchId, app);
        } else if (job.name === 'createJobs') {
          await b2bBulkJobService.processJobCreation(batchId, app);
        }
      } catch (error) {
        console.error(`[BullMQ Worker] Critical failure in job '${job.name}' for batch ${batchId}:`, error);
        
        // Update batch status to failed in case of unhandled worker crash
        const B2BBatch = mongoose.model('B2BBatch');
        await B2BBatch.findByIdAndUpdate(batchId, {
          status: 'failed',
          failedAt: new Date(),
          failureReason: error.message || 'Unhandled worker error'
        });

        // Notify client and admin
        try {
          const { getIO } = require('../sockets');
          const io = getIO();
          const batch = await B2BBatch.findById(batchId);
          if (batch && io) {
            io.to(`b2b:${batch.companyId.toString()}`).emit('b2b:uploadFailed', {
              batchId,
              message: error.message || 'Worker processing failed'
            });
            io.to('admin').emit('admin:batchFailed', { batchId });
          }
        } catch (socketErr) {
          console.error('[BullMQ Worker] Socket notification failure:', socketErr);
        }
      }
    },
    { connection, concurrency: 2 } // Allow processing up to 2 batches concurrently
  );

  worker.on('completed', (job) => {
    console.log(`[BullMQ Worker] Job '${job.name}' (ID: ${job.id}) has completed successfully!`);
  });

  worker.on('failed', (job, err) => {
    console.error(`[BullMQ Worker] Job '${job.name}' (ID: ${job.id}) failed with error: ${err.message}`);
  });

  worker.on('error', (err) => {
    console.error(`[BullMQ Worker] Critical Error in b2bBulkJobQueueService: ${err.message}`);
  });

  bulkJobQueue.on('error', (err) => {
    console.error(`[BullMQ Queue] Error in b2bBulkJobQueueService: ${err.message}`);
  });

  return worker;
};

module.exports = {
  bulkJobQueue,
  initBulkJobWorker
};
