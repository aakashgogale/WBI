const { Queue, Worker: BullWorker, QueueEvents } = require('bullmq');
const IORedis = require('ioredis');
const Booking = require('../models/Booking');
const { getIO } = require('../sockets');

// Initialize Redis connection
const redisOptions = { 
  maxRetriesPerRequest: null,
  retryStrategy: times => Math.min(times * 200, 5000)
};
const connection = new IORedis(process.env.REDIS_URL || 'redis://127.0.0.1:6379', redisOptions);

connection.on('error', (err) => {
  console.error('[Redis Error in queueService]', err);
});

// Create Queue
const bookingAssignmentQueue = new Queue('booking-assignment-queue', { connection });

bookingAssignmentQueue.on('error', (err) => {
  console.error('[Queue Error] bookingAssignmentQueue:', err.message);
});

// Initialize Worker
const bookingAssignmentWorker = new BullWorker(
  'booking-assignment-queue',
  async (job) => {
    if (job.name === 'processWaveTimeout') {
      const { bookingId, waveNumber } = job.data;
      console.log(`[Queue] Processing timeout for Booking: ${bookingId}, Wave: ${waveNumber}`);

      try {
        const booking = await Booking.findById(bookingId);

        if (!booking) {
          console.log(`[Queue] Booking ${bookingId} not found.`);
          return;
        }

        // Check if booking is still awaiting acceptance and if we are checking the correct wave
        if (booking.status !== 'searching_worker') {
          console.log(`[Queue] Booking ${bookingId} status is ${booking.status}. Skipping timeout.`);
          return;
        }

        if (booking.currentWave !== waveNumber) {
          console.log(`[Queue] Booking ${bookingId} is currently on wave ${booking.currentWave}, job is for wave ${waveNumber}. Skipping timeout.`);
          return;
        }

        console.log(`[Queue] Wave ${waveNumber} timed out for booking ${bookingId}. Moving to next step.`);

        // Require here to avoid circular dependency
        const WaveManagerService = require('./WaveManagerService');

        // Check if there are more waves available
        // potentialWorkers is grouped/chunked, so we check if there's a wave index matching currentWave
        // However, if we didn't chunk it in DB, we'll calculate based on pagination.
        // Let's assume WaveManagerService groups them, or we just calculate it.
        const nextWave = waveNumber + 1;
        const totalWaves = booking.potentialWorkers ? booking.potentialWorkers.length : 0; // Assuming potentialWorkers is an array of arrays (waves)

        if (nextWave <= totalWaves) {
           console.log(`[Queue] Triggering Wave ${nextWave} for Booking ${bookingId}`);
           await WaveManagerService.dispatchWave(bookingId, nextWave);
        } else {
           console.log(`[Queue] All waves exhausted for Booking ${bookingId}. Admin action required.`);
           
           // Exhaustion logic
           booking.status = 'pending'; // Revert or set to specific exhausted state
           booking.adminApprovalStatus = 'pending';
           booking.adminLog.push({
             action: 'Auto-Assignment Exhausted',
             reason: `All ${totalWaves} waves timed out or rejected.`,
             timestamp: new Date()
           });
           await booking.save();

           const io = getIO();
           if (io) {
             // Emit to user
             io.to(`user:${booking.userId.toString()}`).emit('booking:noWorkerAvailable', {
               bookingId: booking._id,
               message: 'No technicians are currently available in your area. We are looking into it.'
             });
             
             // Emit to admin
             io.to('admin').emit('admin:bookingActionRequired', { 
               bookingId: booking._id,
               message: 'Auto-assignment failed. No workers available.'
             });
           }
        }
      } catch (err) {
        console.error(`[Queue] Error processing wave timeout:`, err);
      }
    }
  },
  { connection }
);

bookingAssignmentWorker.on('completed', (job) => {
  console.log(`[Queue] Job ${job.id} has completed!`);
});

bookingAssignmentWorker.on('failed', (job, err) => {
  console.log(`[Queue] Job ${job.id} has failed with ${err.message}`);
});

bookingAssignmentWorker.on('error', (err) => {
  console.error(`[Queue] Worker error: ${err.message}`);
});

module.exports = {
  bookingAssignmentQueue
};
