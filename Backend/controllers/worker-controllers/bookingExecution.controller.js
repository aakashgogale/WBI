const Booking = require('../../models/Booking');
const BookingTimeline = require('../../models/BookingTimeline');
const { BOOKING_STATUS } = require('../../utils/constants');
const { getIO } = require('../../sockets');
const crypto = require('crypto');

// Generate 4-digit OTP
const generateOTP = () => Math.floor(1000 + Math.random() * 9000).toString();

exports.startJourney = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const workerId = req.userId;

    const booking = await Booking.findOneAndUpdate(
      { _id: bookingId, workerId, status: { $in: [BOOKING_STATUS.ASSIGNED, BOOKING_STATUS.WORKER_ASSIGNED, BOOKING_STATUS.ACCEPTED] } },
      { 
        $set: { 
          status: BOOKING_STATUS.JOURNEY_STARTED,
          journeyStartedAt: new Date()
        }
      },
      { new: true }
    );

    if (!booking) {
      return res.status(400).json({ success: false, message: 'Booking not found or cannot start journey yet.' });
    }

    await BookingTimeline.create({
      bookingId,
      status: BOOKING_STATUS.JOURNEY_STARTED,
      title: 'Technician on the way',
      message: 'Technician has started their journey to your location.',
      actorRole: 'worker',
      actorId: workerId
    });

    const io = getIO();
    io.to(`booking_${bookingId}`).emit('booking:onTheWay', { bookingId });
    io.to('admin:wbi').emit('admin:bookingUpdated', { bookingId, status: BOOKING_STATUS.JOURNEY_STARTED });

    res.json({ success: true, message: 'Journey started successfully', booking });
  } catch (error) {
    console.error('Error starting journey:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.arrived = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const workerId = req.userId;

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins expiry

    const booking = await Booking.findOneAndUpdate(
      { _id: bookingId, workerId, status: BOOKING_STATUS.JOURNEY_STARTED },
      { 
        $set: { 
          status: BOOKING_STATUS.ARRIVED,
          visitedAt: new Date(),
          visitOtp: otp,
          otpExpiresAt: expiresAt,
          otpAttempts: 0
        }
      },
      { new: true }
    );

    if (!booking) {
      return res.status(400).json({ success: false, message: 'Booking not found or not in journey phase.' });
    }

    await BookingTimeline.create({
      bookingId,
      status: BOOKING_STATUS.ARRIVED,
      title: 'Technician Arrived',
      message: 'Technician has reached the location. Please share the OTP.',
      actorRole: 'worker',
      actorId: workerId
    });

    const io = getIO();
    io.to(`booking_${bookingId}`).emit('booking:arrived', { bookingId, otp, expiresAt });
    io.to('admin:wbi').emit('admin:bookingUpdated', { bookingId, status: BOOKING_STATUS.ARRIVED });

    // Normally send SMS here
    // await sendSms(booking.userPhone, `Your service OTP is ${otp}`);

    res.json({ success: true, message: 'Marked arrived and OTP generated' });
  } catch (error) {
    console.error('Error marking arrived:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { otp } = req.body;
    const workerId = req.userId;

    const booking = await Booking.findOne({ _id: bookingId, workerId, status: BOOKING_STATUS.ARRIVED }).select('+visitOtp');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found or not waiting for OTP.' });
    }

    if (booking.otpAttempts >= 3) {
      return res.status(400).json({ success: false, message: 'Max OTP attempts reached. Please request a new one.' });
    }

    if (new Date() > booking.otpExpiresAt) {
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
    }

    if (booking.visitOtp !== otp) {
      booking.otpAttempts += 1;
      await booking.save();
      return res.status(400).json({ success: false, message: 'Invalid OTP.' });
    }

    booking.status = BOOKING_STATUS.SERVICE_STARTED;
    booking.startedAt = new Date();
    await booking.save();

    await BookingTimeline.create({
      bookingId,
      status: BOOKING_STATUS.SERVICE_STARTED,
      title: 'Service Started',
      message: 'OTP verified. Technician has started the service.',
      actorRole: 'worker',
      actorId: workerId
    });

    const io = getIO();
    io.to(`booking_${bookingId}`).emit('booking:serviceStarted', { bookingId });
    io.to('admin:wbi').emit('admin:bookingUpdated', { bookingId, status: BOOKING_STATUS.SERVICE_STARTED });

    res.json({ success: true, message: 'OTP Verified successfully. Service started.' });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.addProof = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { proofUrl, type, notes } = req.body; // type: before/after
    const workerId = req.userId;

    const booking = await Booking.findOne({ _id: bookingId, workerId });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    booking.workPhotos.push(proofUrl);
    if (notes) {
      booking.workerNotes = booking.workerNotes ? booking.workerNotes + '\n' + notes : notes;
    }
    await booking.save();

    const title = type === 'before' ? 'Before Inspection Photo Uploaded' : 'Work Proof Uploaded';
    
    await BookingTimeline.create({
      bookingId,
      status: BOOKING_STATUS.IN_PROGRESS,
      title: title,
      message: 'Technician has uploaded service photos.',
      actorRole: 'worker',
      actorId: workerId
    });

    const io = getIO();
    io.to(`booking_${bookingId}`).emit('booking:proofUploaded', { bookingId, proofUrl });

    res.json({ success: true, message: 'Proof uploaded successfully' });
  } catch (error) {
    console.error('Error adding proof:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.completeService = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const workerId = req.userId;

    const booking = await Booking.findOne({ _id: bookingId, workerId });
    if (!booking || booking.status !== BOOKING_STATUS.SERVICE_STARTED) {
      return res.status(400).json({ success: false, message: 'Cannot complete this booking' });
    }

    // Ensure minimal validation (e.g. at least 1 photo uploaded)
    if (!booking.workPhotos || booking.workPhotos.length === 0) {
      return res.status(400).json({ success: false, message: 'Please upload at least one work proof photo before completing.' });
    }

    // Finalize amount
    // Base logic: basePrice + tax + extraCharges - discount
    let total = booking.basePrice || 0;
    booking.extraCharges.forEach(ec => {
      total += ec.total;
    });
    total += (booking.tax || 0);
    total -= (booking.discount || 0);
    
    booking.finalAmount = Math.max(total, 0);
    booking.userPayableAmount = booking.finalAmount;

    booking.status = BOOKING_STATUS.WORK_DONE;
    booking.completedAt = new Date();
    
    // Check if previously paid or online
    if (booking.paymentStatus !== 'success') {
      booking.status = BOOKING_STATUS.WORK_DONE; // Wait for payment
    } else {
      booking.status = BOOKING_STATUS.COMPLETED;
    }

    await booking.save();

    await BookingTimeline.create({
      bookingId,
      status: BOOKING_STATUS.WORK_DONE,
      title: 'Service Completed',
      message: 'Technician has completed the service. Bill generated.',
      actorRole: 'worker',
      actorId: workerId
    });

    const io = getIO();
    io.to(`booking_${bookingId}`).emit('booking:completed', { bookingId, finalAmount: booking.finalAmount });
    io.to('admin:wbi').emit('admin:bookingUpdated', { bookingId, status: BOOKING_STATUS.WORK_DONE });

    res.json({ success: true, message: 'Service marked as completed', finalAmount: booking.finalAmount });
  } catch (error) {
    console.error('Error completing service:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
