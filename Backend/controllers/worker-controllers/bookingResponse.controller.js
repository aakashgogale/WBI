const Booking = require('../../models/Booking');
const WorkerAssignmentAttempt = require('../../models/WorkerAssignmentAttempt');
const BookingTimeline = require('../../models/BookingTimeline');
const { getIO } = require('../../sockets');

exports.acceptBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const workerId = req.userId; 

    // Lock booking using atomic update
    const updatedBooking = await Booking.findOneAndUpdate(
      { _id: bookingId, status: { $in: ['searching_worker', 'request_sent'] } },
      { 
        $set: { 
          status: 'worker_assigned',
          workerId: workerId,
          assignedAt: new Date()
        }
      },
      { new: true }
    );

    if (!updatedBooking) {
       console.log(`[WORKER_REJECTED] Worker: ${workerId} tried to accept but booking ${bookingId} already assigned or not searching.`);
       return res.status(400).json({ success: false, message: 'Booking already assigned to another technician or no longer available.' });
    }

    console.log(`[WORKER_ACCEPTED] Booking: ${bookingId}, Worker: ${workerId}`);

    // Update attempt
    const attempt = await WorkerAssignmentAttempt.findOne({ bookingId, workerId, status: 'sent' });
    if (attempt) {
      attempt.status = 'accepted';
      attempt.respondedAt = new Date();
      attempt.responseTimeSec = (attempt.respondedAt - attempt.sentAt) / 1000;
      await attempt.save();
    }

    // Set worker to busy
    const Worker = require('../../models/Worker');
    await Worker.findByIdAndUpdate(workerId, { status: 'BUSY' });

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
    // Notify User
    io.to(`booking_${bookingId}`).emit('booking:workerAccepted', {
      message: 'Technician confirmed!',
      workerId: workerId
    });
    console.log(`[USER_EVENT_EMITTED] booking:workerAccepted for booking: ${bookingId}`);

    // Notify Admin
    io.to('admin:wbi').emit('admin:workerAccepted', { bookingId, workerId });
    console.log(`[ADMIN_EVENT_EMITTED] admin:workerAccepted for booking: ${bookingId}`);

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

    // System will continue matching via the MatchingService timeout or sequential loop.
    res.status(200).json({ success: true, message: 'Booking rejected' });
  } catch (error) {
    console.error('Error rejecting booking:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
