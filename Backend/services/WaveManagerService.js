const Worker = require('../models/Worker');
const Booking = require('../models/Booking');
const { getIO } = require('../sockets');
const { bookingAssignmentQueue } = require('./queueService');

const WAVE_SIZE = 3;
const WAVE_TIMEOUT_MS = 60000; // 60 seconds

class WaveManagerService {
  
  /**
   * Finds nearby workers, groups them into waves (arrays of arrays), and returns the grouped array.
   * @param {number} lat Latitude
   * @param {number} lng Longitude
   * @param {number} radius Radius in km
   * @returns {Array<Array<Object>>} Array of waves, where each wave is an array of worker objects
   */
  async findAndGroupWorkers(lat, lng, radius = 10) {
    if (!lat || !lng) throw new Error('Latitude and longitude are required');

    // Find workers using $near within radius
    const workers = await Worker.find({
      status: 'ONLINE',
      location: {
        $nearSphere: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: radius * 1000 // Convert km to meters
        }
      }
    })
    .select('_id name rating completedJobs location fcmTokens')
    .lean();

    // Group into waves
    const waves = [];
    for (let i = 0; i < workers.length; i += WAVE_SIZE) {
      const waveWorkers = workers.slice(i, i + WAVE_SIZE).map(w => ({
        workerId: w._id,
        distance: 0 // In a real app, you can calculate exact distance here or use MongoDB aggregation $geoNear
      }));
      waves.push(waveWorkers);
    }

    return waves;
  }

  /**
   * Dispatches a specific wave of workers for a booking
   * @param {String} bookingId The ID of the booking
   * @param {Number} waveNumber The wave index (1-indexed)
   */
  async dispatchWave(bookingId, waveNumber) {
    console.log(`[WaveManager] Dispatching Wave ${waveNumber} for Booking ${bookingId}`);
    
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      console.log(`[WaveManager] Booking ${bookingId} not found`);
      return;
    }

    // Check if waveNumber is within bounds of potentialWorkers
    // Assuming potentialWorkers is structured as Array of Waves (Array of Arrays)
    // Wait, Booking schema has potentialWorkers as a flat array.
    // Let's adapt it to use flat array and pagination if schema is flat.
    // Let's check the schema: potentialWorkers: [{ workerId: ref, distance: Number }]
    // Since it's a flat array, we will paginate it here.
    
    const totalWorkers = booking.potentialWorkers.length;
    const startIndex = (waveNumber - 1) * WAVE_SIZE;
    const endIndex = startIndex + WAVE_SIZE;

    if (startIndex >= totalWorkers) {
       console.log(`[WaveManager] Wave ${waveNumber} is out of bounds. All workers exhausted.`);
       return;
    }

    const currentWaveWorkers = booking.potentialWorkers.slice(startIndex, endIndex);

    // Update booking state
    booking.currentWave = waveNumber;
    booking.waveStartedAt = new Date();
    await booking.save();

    const io = getIO();
    
    // Broadcast to workers in this wave
    currentWaveWorkers.forEach(workerObj => {
      const workerIdStr = workerObj.workerId.toString();
      console.log(`[WaveManager] Emitting to worker:${workerIdStr}`);
      
      io.to(`worker:${workerIdStr}`).emit('worker:newBookingRequest', {
        bookingId: booking._id,
        serviceName: booking.serviceName,
        address: booking.address,
        scheduledDate: booking.scheduledDate,
        scheduledTime: booking.scheduledTime,
        price: booking.basePrice,
        waveNumber: waveNumber
      });
    });

    // Add Delayed Job to Queue
    await bookingAssignmentQueue.add(
      'processWaveTimeout',
      { bookingId: booking._id.toString(), waveNumber },
      { delay: WAVE_TIMEOUT_MS, jobId: `timeout-${booking._id}-${waveNumber}` }
    );
    
    console.log(`[WaveManager] Added timeout job for Wave ${waveNumber} with ${WAVE_TIMEOUT_MS}ms delay.`);
  }

}

module.exports = new WaveManagerService();
