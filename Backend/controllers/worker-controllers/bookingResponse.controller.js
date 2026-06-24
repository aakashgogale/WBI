const Booking = require('../../models/Booking');
const WorkerAssignmentAttempt = require('../../models/WorkerAssignmentAttempt');
const BookingTimeline = require('../../models/BookingTimeline');
const { getIO } = require('../../sockets');
const Worker = require('../../models/Worker');
const matchingService = require('../../services/matchingService');

exports.acceptBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const workerId = req.userId || (req.user && (req.user.id || req.user._id));

    console.log(`[WORKER_ACCEPT_ATTEMPT] Worker ${workerId} attempting to accept booking ${bookingId}`);

    // Lock booking using atomic update
    const updatedBooking = await Booking.findOneAndUpdate(
      {
        _id: bookingId,
        status: 'searching_worker',
        $or: [
          { workerId: null },
          { workerId: { $exists: false } }
        ]
      },
      { 
        $set: { 
          status: 'worker_assigned',
          workerId: workerId,
          assignedAt: new Date(),
          workerAcceptedAt: new Date(),
          workerResponse: 'ACCEPTED'
        }
      },
      { new: true }
    );

    if (!updatedBooking) {
      console.log(`[WORKER_ACCEPT_FAILED_ALREADY_ASSIGNED] Worker ${workerId} accept failed: already assigned for booking ${bookingId}`);
      
      const io = getIO();
      io.to(`worker:${workerId}`).emit('worker:bookingAlreadyAssigned', {
        bookingId,
        message: 'This booking has already been accepted by another worker.'
      });

      return res.status(400).json({
        success: false,
        message: 'This booking has already been accepted by another worker.'
      });
    }

    console.log(`[WORKER_ACCEPTED_FIRST] Worker ${workerId} accepted first for booking ${bookingId}`);

    // Update winning worker's assignment attempt
    const attempt = await WorkerAssignmentAttempt.findOne({ bookingId, workerId, status: 'sent' });
    if (attempt) {
      attempt.status = 'accepted';
      attempt.respondedAt = new Date();
      attempt.responseTimeSec = (attempt.respondedAt - attempt.sentAt) / 1000;
      await attempt.save();
    }

    // Set worker to busy
    await Worker.findByIdAndUpdate(workerId, { status: 'BUSY', availability: 'ON_JOB' });

    // Log timeline
    await BookingTimeline.create({
      bookingId,
      status: 'worker_assigned',
      title: 'Technician Confirmed',
      message: 'A technician has accepted your request.',
      actorRole: 'worker',
      actorId: workerId
    });

    const io = getIO();

    // Expire other workers' requests
    const otherAttempts = await WorkerAssignmentAttempt.find({
      bookingId,
      workerId: { $ne: workerId },
      status: 'sent'
    });

    if (otherAttempts.length > 0) {
      await WorkerAssignmentAttempt.updateMany(
        { bookingId, workerId: { $ne: workerId }, status: 'sent' },
        { $set: { status: 'expired', reason: 'accepted_by_other_worker' } }
      );

      for (const otherAttempt of otherAttempts) {
        io.to(`worker:${otherAttempt.workerId}`).emit('worker:bookingExpired', {
          bookingId,
          message: 'This booking has already been accepted by another worker.'
        });
        console.log(`[WORKER_EXPIRED_EMITTED] Sent worker:bookingExpired to worker: ${otherAttempt.workerId}`);
      }
    }

    // Notify User
    io.to(`booking_${bookingId}`).emit('booking:workerAccepted', {
      message: 'Technician confirmed!',
      workerId: workerId
    });
    console.log(`[USER_TECHNICIAN_FOUND] User notified of assigned worker ${workerId} for booking ${bookingId}`);

    // Notify Admin
    io.to('admin:wbi').emit('admin:workerAccepted', { bookingId, workerId });
    console.log(`[ADMIN_UPDATED] Admin updated for booking ${bookingId} assignment to ${workerId}`);

    res.status(200).json({ success: true, message: 'Booking accepted successfully', booking: updatedBooking });
  } catch (error) {
    console.error('Error accepting booking:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.rejectBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const workerId = req.userId;

    const attempt = await WorkerAssignmentAttempt.findOne({ bookingId, workerId, status: 'sent' });
    if (!attempt) {
      return res.status(400).json({ success: false, message: 'Invalid or expired request' });
    }

    attempt.status = 'rejected';
    attempt.respondedAt = new Date();
    attempt.responseTimeSec = (attempt.respondedAt - attempt.sentAt) / 1000;
    await attempt.save();
    
    console.log(`[WORKER_REJECTED] Booking: ${bookingId}, Worker: ${workerId}`);

    // Continue matching via matchingService
    await matchingService.continueMatching(bookingId);

    res.status(200).json({ success: true, message: 'Booking rejected' });
  } catch (error) {
    console.error('Error rejecting booking:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
