const Booking = require('../../models/Booking');
const Worker = require('../../models/Worker');
const WorkerResponseLog = require('../../models/WorkerResponseLog');
const PayoutRule = require('../../models/PayoutRule');
const Wallet = require('../../models/Wallet');
const { getIO } = require('../../sockets');
const WaveManagerService = require('../../services/WaveManagerService');
const { bookingAssignmentQueue } = require('../../services/queueService');

exports.respondToBooking = async (req, res) => {
  try {
    const { action } = req.body; // 'accept' or 'reject'
    const workerId = req.user.id;
    const booking = await Booking.findById(req.params.id);

    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.status !== 'searching_worker') {
      return res.status(400).json({ success: false, message: 'Booking no longer available' });
    }

    if (action === 'accept') {
      booking.status = 'accepted';
      booking.workerId = workerId;
      booking.acceptedAt = new Date();
      await booking.save();

      // Update worker status
      await Worker.findByIdAndUpdate(workerId, { status: 'BUSY' });

      // Log response
      await WorkerResponseLog.create({
        bookingId: booking._id,
        workerId: workerId,
        serviceId: booking.serviceId,
        status: 'accepted',
        respondedAt: new Date()
      });

      // Cancel pending timeout job if we want to be clean
      try {
        const jobId = `timeout-${booking._id}-${booking.currentWave}`;
        const job = await bookingAssignmentQueue.getJob(jobId);
        if (job) await job.remove();
      } catch (err) {
        console.error('Failed to remove timeout job on accept', err);
      }

      // Notify User and Admin
      const io = getIO();
      io.to(`user:${booking.userId.toString()}`).emit('booking:statusUpdated', { status: 'accepted', workerId });
      io.to('admin').emit('admin:bookingUpdated', { bookingId: booking._id, status: 'accepted' });

      return res.status(200).json({ success: true, message: 'Booking accepted' });
    } else {
      // Logic for reject
      booking.notifiedWorkers.push(workerId); // Don't notify them again
      await booking.save();

      await WorkerResponseLog.create({
        bookingId: booking._id,
        workerId: workerId,
        serviceId: booking.serviceId,
        status: 'rejected',
        respondedAt: new Date()
      });

      // Check if all workers in current wave have responded
      // This is a simplified check. We query WorkerResponseLog for this booking
      const responses = await WorkerResponseLog.find({ bookingId: booking._id });
      const respondedWorkerIds = responses.map(r => r.workerId.toString());
      
      const waveNumber = booking.currentWave;
      const WAVE_SIZE = 3;
      const startIndex = (waveNumber - 1) * WAVE_SIZE;
      const endIndex = startIndex + WAVE_SIZE;
      
      const currentWaveWorkers = booking.potentialWorkers.slice(startIndex, endIndex);
      const allResponded = currentWaveWorkers.every(w => respondedWorkerIds.includes(w.workerId.toString()));

      if (allResponded) {
        console.log(`[Reject] All workers in wave ${waveNumber} rejected. Immediately dispatching next wave.`);
        
        // Remove pending timeout job to prevent double firing
        try {
          const jobId = `timeout-${booking._id}-${waveNumber}`;
          const job = await bookingAssignmentQueue.getJob(jobId);
          if (job) await job.remove();
        } catch (err) {
          console.error('Failed to remove timeout job on reject', err);
        }

        await WaveManagerService.dispatchWave(booking._id.toString(), waveNumber + 1);
      }

      return res.status(200).json({ success: true, message: 'Booking rejected' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body; // 'en_route', 'arrived', 'service_started'
    const booking = await Booking.findOneAndUpdate(
      { _id: req.params.id, workerId: req.user.id },
      { status },
      { new: true }
    );

    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    const io = getIo();
    io.to(`user:${booking.userId.toString()}`).emit('booking:statusUpdated', { status });
    
    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateLiveLocation = async (req, res) => {
  try {
    const { lat, lng } = req.body;
    
    // Broadcast to relevant booking rooms
    // E.g., find active booking for this worker
    const activeBooking = await Booking.findOne({ workerId: req.user.id, status: { $in: ['en_route', 'arrived'] } });
    
    if (activeBooking) {
      const io = getIo();
      io.to(`user:${activeBooking.userId.toString()}`).emit('worker:locationUpdated', { lat, lng });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.uploadProofs = async (req, res) => {
  try {
    const { proofImages } = req.body; // Assume uploaded to S3/Cloudinary prior to this, passing URLs
    const booking = await Booking.findOneAndUpdate(
      { _id: req.params.id, workerId: req.user.id },
      { $push: { workPhotos: { $each: proofImages } }, status: 'proof_uploaded' },
      { new: true }
    );
    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.completeBooking = async (req, res) => {
  try {
    const booking = await Booking.findOneAndUpdate(
      { _id: req.params.id, workerId: req.user.id },
      { status: 'completed', completedAt: new Date() },
      { new: true }
    );

    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    // Handle Escrow / Payout logic if it's prepaid
    if (booking.paymentStatus === 'paid') {
      // Dynamic Payout Rule Calculation
      const rule = await PayoutRule.findOne({ isActive: true }); // Ideally matched by serviceId
      
      let workerShare = booking.finalAmount;
      if (rule && rule.workerShareType === 'percentage') {
        workerShare = (booking.finalAmount * rule.workerShareValue) / 100;
      } else if (rule && rule.workerShareType === 'fixed') {
        workerShare = rule.workerShareValue;
      }

      // Credit Wallet
      await Wallet.findOneAndUpdate(
        { ownerId: req.user.id, ownerType: 'worker' },
        { 
          $inc: { availableBalance: workerShare, totalEarned: workerShare }
        },
        { upsert: true }
      );
      
      booking.isWorkerPaid = true;
      booking.workerPaymentStatus = 'SUCCESS';
      await booking.save();
    }

    // Free the worker
    await Worker.findByIdAndUpdate(req.worker.id, { status: 'ONLINE' });

    const io = getIo();
    io.to(`user:${booking.userId.toString()}`).emit('booking:statusUpdated', { status: 'completed' });
    io.to('admin').emit('admin:bookingUpdated', { bookingId: booking._id, status: 'completed' });

    res.status(200).json({ success: true, message: 'Service completed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
