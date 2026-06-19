const Booking = require('../../models/Booking');
const { validationResult } = require('express-validator');
const { BOOKING_STATUS, PAYMENT_STATUS } = require('../../utils/constants');

/**
 * Get assigned jobs for worker
 */
const getAssignedJobs = async (req, res) => {
  try {
    const workerId = req.user.id;
    const { status, page = 1, limit = 10 } = req.query;

    // Build query
    const baseQuery = {
      $or: [
        { workerId },
        { workerId: null, notifiedWorkers: workerId, status: BOOKING_STATUS.CONFIRMED }
      ]
    };
    
    let query = { ...baseQuery };
    if (status && status !== 'all') {
      if (status === 'assigned') {
        // "Assigned" tab should also include broadcasted jobs (which are CONFIRMED) and successfully assigned jobs
        query.status = { $in: [BOOKING_STATUS.ASSIGNED, BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.ACCEPTED, BOOKING_STATUS.WORKER_ASSIGNED] };
      } else if (status === 'in_progress') {
        query.status = { $in: [BOOKING_STATUS.JOURNEY_STARTED, BOOKING_STATUS.VISITED, BOOKING_STATUS.IN_PROGRESS] };
      } else if (status === 'completed') {
        query.status = { $in: [BOOKING_STATUS.WORK_DONE, BOOKING_STATUS.COMPLETED] };
      } else {
        query.status = status;
      }
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get bookings
    const bookings = await Booking.find(query)
      .populate('userId', 'name phone email')
      .populate('vendorId', 'name businessName phone')
      .populate('serviceId', 'title iconUrl categoryIcon')
      .populate('categoryId', 'title slug')
      .sort({ scheduledDate: 1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const total = await Booking.countDocuments(query);

    // Get dynamic counts for tabs
    const [all, assigned, inProgress, completed] = await Promise.all([
      Booking.countDocuments(baseQuery),
      Booking.countDocuments({ ...baseQuery, status: { $in: [BOOKING_STATUS.ASSIGNED, BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.ACCEPTED, BOOKING_STATUS.WORKER_ASSIGNED] } }),
      Booking.countDocuments({ ...baseQuery, status: { $in: [BOOKING_STATUS.JOURNEY_STARTED, BOOKING_STATUS.VISITED, BOOKING_STATUS.IN_PROGRESS] } }),
      Booking.countDocuments({ ...baseQuery, status: { $in: [BOOKING_STATUS.WORK_DONE, BOOKING_STATUS.COMPLETED] } })
    ]);

    res.status(200).json({
      success: true,
      data: bookings,
      counts: {
        all,
        assigned,
        in_progress: inProgress,
        completed
      },
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get assigned jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch jobs. Please try again.'
    });
  }
};

/**
 * Get job details by ID
 */
const getJobById = async (req, res) => {
  try {
    const workerId = req.user.id;
    const { id } = req.params;

    const booking = await Booking.findOne({
      _id: id,
      $or: [
        { workerId },
        { notifiedWorkers: workerId }
      ]
    })
      .populate('userId', 'name phone email')
      .populate('vendorId', 'name businessName phone email address')
      .populate('serviceId', 'title description iconUrl images')
      .populate('categoryId', 'title slug');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch job. Please try again.'
    });
  }
};

/**
 * Update job status
 */
const updateJobStatus = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const workerId = req.user.id;
    const { id } = req.params;
    const { status, finalSettlementStatus, workerPaymentStatus } = req.body;

    const booking = await Booking.findOne({ _id: id, workerId });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Validate status transition if status is changing
    if (status && status !== booking.status) {
      const validTransitions = {
        [BOOKING_STATUS.ASSIGNED]: [BOOKING_STATUS.VISITED, BOOKING_STATUS.IN_PROGRESS],
        [BOOKING_STATUS.CONFIRMED]: [BOOKING_STATUS.ASSIGNED, BOOKING_STATUS.IN_PROGRESS],
        [BOOKING_STATUS.VISITED]: [BOOKING_STATUS.WORK_DONE, BOOKING_STATUS.COMPLETED],
        [BOOKING_STATUS.IN_PROGRESS]: [BOOKING_STATUS.WORK_DONE, BOOKING_STATUS.COMPLETED],
        [BOOKING_STATUS.WORK_DONE]: [BOOKING_STATUS.COMPLETED],
        [BOOKING_STATUS.JOURNEY_STARTED]: [BOOKING_STATUS.VISITED, BOOKING_STATUS.IN_PROGRESS]
      };

      if (!validTransitions[booking.status]?.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status transition from ${booking.status} to ${status}`
        });
      }

      // Update booking status
      booking.status = status;

      if (status === BOOKING_STATUS.IN_PROGRESS && !booking.startedAt) {
        booking.startedAt = new Date();
      }

      if (status === BOOKING_STATUS.VISITED && !booking.startedAt) {
        booking.startedAt = new Date();
      }

      if (status === BOOKING_STATUS.COMPLETED) {
        booking.completedAt = new Date();
      }

      // Emit socket event for real-time update to user
      const io = req.app.get('io');
      if (io) {
        io.to(`user_${booking.userId}`).emit('booking_updated', {
          bookingId: booking._id,
          status: booking.status,
          message: `Job status updated to ${booking.status}`
        });
      }

      // Add Push Notification for User
      const { createNotification } = require('../notificationControllers/notificationController');

      if (status === BOOKING_STATUS.IN_PROGRESS) {
        await createNotification({
          userId: booking.userId,
          type: 'work_started',
          title: 'Work In Progress',
          message: 'Professional has started working on your service.',
          relatedId: booking._id,
          relatedType: 'booking',
          priority: 'high',
          pushData: { type: 'in_progress', bookingId: booking._id.toString(), link: `/user/booking/${booking._id}` }
        });
      }

    }

    // Update additional fields
    if (finalSettlementStatus) booking.finalSettlementStatus = finalSettlementStatus;
    if (workerPaymentStatus) {
      booking.workerPaymentStatus = workerPaymentStatus;
      if (workerPaymentStatus === 'PAID' || workerPaymentStatus === 'SUCCESS') {
        booking.isWorkerPaid = true;
        booking.workerPaidAt = booking.workerPaidAt || new Date();
      }
    }

    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Job status updated successfully',
      data: booking
    });
  } catch (error) {
    console.error('Update job status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update job status. Please try again.'
    });
  }
};

/**
 * Mark job as started (Journey Started)
 */
const startJob = async (req, res) => {
  try {
    const workerId = req.user.id;
    const { id } = req.params;

    const booking = await Booking.findOne({ _id: id, workerId });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    if (booking.status !== BOOKING_STATUS.ASSIGNED && booking.status !== BOOKING_STATUS.CONFIRMED && booking.status !== BOOKING_STATUS.ACCEPTED) {
      return res.status(400).json({
        success: false,
        message: `Cannot start journey with status: ${booking.status}`
      });
    }

    // Generate Visit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    // Update booking
    booking.status = BOOKING_STATUS.JOURNEY_STARTED;
    booking.journeyStartedAt = new Date();
    booking.visitOtp = otp; // In production, hash this!

    await booking.save();

    // Notify user with OTP
    const { createNotification } = require('../notificationControllers/notificationController');
    await createNotification({
      userId: booking.userId,
      type: 'worker_started',
      title: 'Worker Started Journey',
      message: `Worker is on the way! specific OTP for site visit verification is: ${otp}. Please share this with worker upon arrival.`,
      relatedId: booking._id,
      relatedType: 'booking',
      priority: 'high',
      pushData: {
        type: 'journey_started',
        bookingId: booking._id.toString(),
        visitOtp: otp,
        link: `/user/booking/${booking._id}`
      }
    });

    // Notify vendor
    await createNotification({
      vendorId: booking.vendorId,
      type: 'worker_started',
      title: 'Worker Started Journey',
      message: `Your worker has started the journey for booking ${booking.bookingNumber}.`,
      relatedId: booking._id,
      relatedType: 'booking',
      pushData: {
        type: 'journey_started',
        bookingId: booking._id.toString(),
        link: `/vendor/bookings/${booking._id}`
      }
    });

    // Explicitly emit socket event
    const io = req.app.get('io');
    if (io) {
      io.to(`user_${booking.userId}`).emit('booking_updated', {
        bookingId: booking._id,
        status: BOOKING_STATUS.JOURNEY_STARTED,
        visitOtp: otp
      });

      // Socket notification removed - createNotification already handles this
    }

    res.status(200).json({
      success: true,
      message: 'Journey started, OTP sent to user',
      data: booking
    });
  } catch (error) {
    console.error('Start job error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start job. Please try again.'
    });
  }
};

/**
 * Worker Reached Location
 * Notify user to share OTP
 */
const workerReachedLocation = async (req, res) => {
  try {
    const workerId = req.user.id;
    const { id } = req.params;

    // Need visitOtp to resend it
    const booking = await Booking.findOne({ _id: id, workerId }).select('+visitOtp');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    if (booking.status !== BOOKING_STATUS.JOURNEY_STARTED) {
      return res.status(400).json({ success: false, message: 'Journey not started yet' });
    }

    const otp = booking.visitOtp;

    // Notify user
    const { createNotification } = require('../notificationControllers/notificationController');
    await createNotification({
      userId: booking.userId,
      type: 'vendor_reached',
      title: 'Professional has Reached!',
      message: `Professional has reached your location. Please share this OTP: ${otp}`,
      relatedId: booking._id,
      relatedType: 'booking',
      priority: 'high',
      pushData: {
        type: 'vendor_reached',
        bookingId: booking._id.toString(),
        visitOtp: otp,
        link: `/user/booking/${booking._id}`
      }
    });

    res.status(200).json({ success: true, message: 'User notified that professional reached' });
  } catch (error) {
    console.error('Worker reached location error:', error);
    res.status(500).json({ success: false, message: 'Failed to notify user' });
  }
};

/**
 * Verify Site Visit with OTP
 */
const verifyVisit = async (req, res) => {
  try {
    const workerId = req.user.id;
    const { id } = req.params;
    const { otp, location } = req.body;

    // Use query to select visitOtp which is usually hidden
    const booking = await Booking.findOne({ _id: id, workerId }).select('+visitOtp');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    if (booking.status !== BOOKING_STATUS.JOURNEY_STARTED) {
      return res.status(400).json({ success: false, message: 'Worker has not started journey yet' });
    }

    if (booking.visitOtp !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    // Update status
    booking.status = BOOKING_STATUS.VISITED;
    booking.visitedAt = new Date();
    booking.startedAt = new Date(); // Legacy compatibility
    booking.visitOtp = undefined; // Clear OTP
    if (location) {
      booking.visitLocation = {
        ...location,
        verifiedAt: new Date()
      };
    }

    await booking.save();

    // Notify user
    // Notify user
    const { createNotification } = require('../notificationControllers/notificationController');
    await createNotification({
      userId: booking.userId,
      type: 'visit_verified',
      title: 'Visit Verified',
      message: `The professional has arrived and verified the visit. Service is now in progress.`,
      relatedId: booking._id,
      relatedType: 'booking',
      priority: 'high', // Ensure high priority
      pushData: {
        type: 'visit_verified',
        bookingId: booking._id.toString(),
        link: `/user/booking/${booking._id}`
      }
    });

    // Emit socket event for real-time update
    const io = req.app.get('io');
    if (io) {
      io.to(`user_${booking.userId}`).emit('booking_updated', {
        bookingId: booking._id,
        status: booking.status,
        message: 'Visit verified successful'
      });
      // Socket notification removed - createNotification already handles this
    }

    res.status(200).json({
      success: true,
      message: 'Site visit verified successfully',
      data: booking
    });
  } catch (error) {
    console.error('Verify visit error:', error);
    res.status(500).json({ success: false, message: 'Failed to verifying visit' });
  }
};

/**
 * Mark job as completed (Work Done) & Generate Payment OTP
 */
const completeJob = async (req, res) => {
  try {
    const workerId = req.user.id;
    const { id } = req.params;
    const { workPhotos, workDoneDetails, customerSignature, completionReport } = req.body;

    const booking = await Booking.findOne({ _id: id, workerId });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    if (booking.status !== BOOKING_STATUS.VISITED && booking.status !== BOOKING_STATUS.IN_PROGRESS) {
      return res.status(400).json({
        success: false,
        message: `Cannot complete job with status: ${booking.status}`
      });
    }

    // Update booking
    booking.status = BOOKING_STATUS.WORK_DONE;

    // Reuse existing Payment OTP or generate new one
    const payOtp = booking.paymentOtp || Math.floor(1000 + Math.random() * 9000).toString();
    booking.paymentOtp = payOtp;

    if (workPhotos && Array.isArray(workPhotos)) {
      booking.workPhotos = workPhotos;
    }
    if (workDoneDetails) {
      booking.workDoneDetails = workDoneDetails;
    }
    if (customerSignature) {
      booking.customerSignature = customerSignature;
    }
    if (completionReport) {
      booking.completionReport = completionReport;
    }

    // Validation Check (required before complete)
    if (!booking.workPhotos || booking.workPhotos.length === 0) {
      return res.status(400).json({ success: false, message: 'Progress images are required to complete the job.' });
    }
    if (!booking.structuredNotes || (!booking.structuredNotes.issueFound && !booking.structuredNotes.resolutionDetails && !booking.workerNotes)) {
      return res.status(400).json({ success: false, message: 'Work notes are required to complete the job.' });
    }
    // We assume customerSignature or OTP verified. We won't block strictly on materials because some jobs might not need materials.

    await booking.save();

    // Notify user
    const { createNotification } = require('../notificationControllers/notificationController');

    // 1. Notify user that work is completed and billing is being prepared
    await createNotification({
      userId: booking.userId,
      type: 'work_completed',
      title: 'Work Completed',
      message: `Work finished!  Please wait for the bill expert is preparing !`,
      relatedId: booking._id,
      relatedType: 'booking',
      priority: 'high',
      pushData: {
        type: 'work_completed',
        bookingId: booking._id.toString(),
        link: `/user/booking/${booking._id}`
      }
    });

    // 2. Notify user with Final Bill and OTP
    await createNotification({
      userId: booking.userId,
      type: 'work_done',
      title: 'Billing Ready',
      message: `Bill Generated: ₹${booking.finalAmount}. Your verification OTP is ${payOtp}. Please verify and share OTP to complete.`,
      relatedId: booking._id,
      relatedType: 'booking',
      priority: 'high',
      pushData: {
        type: 'work_done',
        bookingId: booking._id.toString(),
        paymentOtp: payOtp,
        link: `/user/booking/${booking._id}`
      }
    });

    // Notify vendor
    await createNotification({
      vendorId: booking.vendorId,
      type: 'worker_completed',
      title: 'Work Done',
      message: `Your worker has marked work as done for booking ${booking.bookingNumber}.`,
      relatedId: booking._id,
      relatedType: 'booking',
      pushData: {
        type: 'worker_completed',
        bookingId: booking._id.toString(),
        link: `/vendor/bookings/${booking._id}`
      }
    });

    // Explicitly emit socket event to ensure user gets real-time update
    const io = req.app.get('io');
    if (io) {
      io.to(`user_${booking.userId}`).emit('booking_updated', {
        bookingId: booking._id,
        status: BOOKING_STATUS.WORK_DONE
      });

      // Socket notification removed - createNotification already handles this
    }

    res.status(200).json({
      success: true,
      message: 'Work done marked, OTP sent to user',
      data: booking
    });
  } catch (error) {
    console.error('Complete job error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete job. Please try again.'
    });
  }
};

/**
 * Collect Cash & Complete Booking
 * Uses VendorBill as the single source of truth for earnings.
 */
const collectCash = async (req, res) => {
  try {
    const workerId = req.user.id;
    const { id } = req.params;
    const { otp } = req.body;

    const booking = await Booking.findOne({ _id: id, workerId }).select('+paymentOtp');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    if (booking.status !== BOOKING_STATUS.WORK_DONE) {
      return res.status(400).json({ success: false, message: 'Work is not marked as done yet' });
    }

    if (booking.paymentOtp !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    // Fetch VendorBill (single source of truth)
    const VendorBill = require('../../models/VendorBill');
    const bill = await VendorBill.findOne({ bookingId: booking._id });
    if (!bill) {
      return res.status(500).json({ success: false, message: 'Bill not found — cannot process payment' });
    }

    const grandTotal = Number(bill.grandTotal) || 0;
    const vendorEarning = Number(bill.vendorTotalEarning) || 0;

    // Update Booking Status
    booking.status = BOOKING_STATUS.COMPLETED;
    booking.paymentMethod = 'cash collected'; // Standardized label
    booking.paymentStatus = PAYMENT_STATUS.COLLECTED_BY_VENDOR;
    booking.cashCollected = true;
    booking.cashCollectedBy = 'worker';
    booking.cashCollectorId = workerId;
    booking.cashCollectedAt = new Date();
    booking.completedAt = new Date();
    booking.paymentOtp = undefined;
    await booking.save();

    // Mark bill as paid
    bill.status = 'paid';
    bill.paidAt = new Date();
    await bill.save();

    // Update Vendor Wallet
    const Vendor = require('../../models/Vendor');
    if (booking.vendorId) {
      const vendorDoc = await Vendor.findById(booking.vendorId).select('wallet');
      if (vendorDoc) {
        const currentDues = (vendorDoc.wallet.dues || 0) + grandTotal;
        const cashLimit = vendorDoc.wallet.cashLimit || 10000;
        const netOwed = currentDues - ((vendorDoc.wallet.earnings || 0) + vendorEarning);
        const isBlocked = netOwed > cashLimit;

        const updateQuery = {
          $inc: {
            'wallet.dues': grandTotal,
            'wallet.earnings': vendorEarning,
            'wallet.totalCashCollected': grandTotal
          }
        };

        if (isBlocked) {
          updateQuery.$set = {
            'wallet.isBlocked': true,
            'wallet.blockedAt': new Date(),
            'wallet.blockReason': `Cash limit exceeded. Net owed: ₹${netOwed.toFixed(2)}, Limit: ₹${cashLimit}`
          };
        }

        await Vendor.findByIdAndUpdate(booking.vendorId, updateQuery);

        // Create Transactions
        const Transaction = require('../../models/Transaction');

        // 1. Cash Collected
        await Transaction.create({
          vendorId: booking.vendorId,
          bookingId: booking._id,
          workerId,
          type: 'cash_collected',
          amount: grandTotal,
          status: 'completed',
          paymentMethod: 'cash collected', // Standardized label
          description: `Cash ₹${grandTotal} collected by worker for booking #${booking.bookingNumber}`,
          metadata: {
            type: 'dues_increase',
            collectedBy: 'worker',
            billId: bill._id.toString(),
            grandTotal,
            vendorEarning,
            companyRevenue: bill.companyRevenue
          }
        });

        // 2. Earnings Credit
        if (vendorEarning > 0) {
          await Transaction.create({
            vendorId: booking.vendorId,
            bookingId: booking._id,
            type: 'earnings_credit',
            amount: vendorEarning,
            status: 'completed',
            paymentMethod: 'wallet',
            description: `Earnings ₹${vendorEarning} credited for booking #${booking.bookingNumber} (70% service + 10% parts)`,
            metadata: {
              type: 'earnings_increase',
              billId: bill._id.toString(),
              serviceEarning: bill.vendorServiceEarning,
              partsEarning: bill.vendorPartsEarning
            }
          });
        }
      }
    } else if (booking.workerId) {
      // Independent worker wallet update
      const WorkerModel = require('../../models/Worker');
      const workerDoc = await WorkerModel.findById(workerId);
      if (workerDoc) {
        if (!workerDoc.wallet) {
          workerDoc.wallet = { balance: 0, totalEarnings: 0 };
        }
        
        const companyRevenue = Number(bill.companyRevenue) || 0;
        
        // Net wallet balance deduction is companyRevenue (math: +vendorEarning - grandTotal = -companyRevenue)
        workerDoc.wallet.balance = (workerDoc.wallet.balance || 0) - companyRevenue;
        workerDoc.wallet.totalEarnings = (workerDoc.wallet.totalEarnings || 0) + vendorEarning;
        await workerDoc.save();

        // Create Transactions
        const Transaction = require('../../models/Transaction');

        // 1. Cash Collected
        await Transaction.create({
          workerId: booking.workerId,
          bookingId: booking._id,
          type: 'cash_collected',
          amount: grandTotal,
          status: 'completed',
          paymentMethod: 'cash collected',
          description: `Cash ₹${grandTotal} collected by worker for booking #${booking.bookingNumber}`,
          metadata: {
            type: 'dues_increase',
            collectedBy: 'worker',
            billId: bill._id.toString(),
            grandTotal,
            vendorEarning,
            companyRevenue
          }
        });

        // 2. Earnings Credit
        if (vendorEarning > 0) {
          await Transaction.create({
            workerId: booking.workerId,
            bookingId: booking._id,
            type: 'earnings_credit',
            amount: vendorEarning,
            status: 'completed',
            paymentMethod: 'wallet',
            description: `Earnings ₹${vendorEarning} credited for booking #${booking.bookingNumber}`,
            metadata: {
              type: 'earnings_increase',
              billId: bill._id.toString(),
              serviceEarning: bill.vendorServiceEarning,
              partsEarning: bill.vendorPartsEarning
            }
          });
        }
      }
    }

    // Notify User
    const { createNotification } = require('../notificationControllers/notificationController');
    await createNotification({
      userId: booking.userId,
      type: 'payment_received',
      title: 'Payment Received (Cash)',
      message: `Payment of ₹${grandTotal} received in cash for booking ${booking.bookingNumber}. Job Completed. Thanks!`,
      relatedId: booking._id,
      relatedType: 'booking',
      priority: 'high'
    });

    res.status(200).json({
      success: true,
      message: 'Cash collected and job completed',
      data: booking
    });

  } catch (error) {
    console.error('Collect cash error:', error);
    res.status(500).json({ success: false, message: 'Failed to collect cash' });
  }
};

/**
 * Add worker notes to booking
 */
const addWorkerNotes = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const workerId = req.user.id;
    const { id } = req.params;
    const { notes, structuredNotes } = req.body;

    const booking = await Booking.findOne({ _id: id, workerId });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Update booking
    if (notes) booking.workerNotes = notes;
    if (structuredNotes) {
      booking.structuredNotes = {
        ...(booking.structuredNotes || {}),
        ...structuredNotes
      };
    }

    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Notes added successfully',
      data: booking
    });
  } catch (error) {
    console.error('Add worker notes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add notes. Please try again.'
    });
  }
};

/**
 * Respond to job (Accept/Reject)
 */
const respondToJob = async (req, res) => {
  try {
    const workerId = req.user.id;
    const { id } = req.params;
    const { status } = req.body; // 'ACCEPTED' or 'REJECTED'

    // Allow finding job if assigned OR if currently notified/searching
    const booking = await Booking.findOne({
      _id: id,
      $or: [
        { workerId },
        { notifiedWorkers: workerId }
      ]
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    // Idempotency check: If already in desired state, return success without re-notifying
    if (status === 'ACCEPTED' && booking.workerResponse === 'ACCEPTED') {
      return res.status(200).json({ success: true, message: 'Job already accepted', data: booking });
    }

    if (status === 'REJECTED' && booking.workerResponse === 'REJECTED') {
      return res.status(200).json({ success: true, message: 'Job already rejected', data: booking });
    }

    const WorkerAssignmentAttempt = require('../../models/WorkerAssignmentAttempt');
    const BookingTimeline = require('../../models/BookingTimeline');
    const WorkerModel = require('../../models/Worker');
    const { getIO } = require('../../sockets');

    if (status === 'ACCEPTED') {
      // Set assignment details atomically
      booking.workerId = workerId;
      booking.status = BOOKING_STATUS.WORKER_ASSIGNED; // worker_assigned
      booking.workerAcceptedAt = new Date();
      booking.workerResponse = 'ACCEPTED';
      await booking.save();

      // Update attempt
      const attempt = await WorkerAssignmentAttempt.findOne({ bookingId: id, workerId, status: 'sent' });
      if (attempt) {
        attempt.status = 'accepted';
        attempt.respondedAt = new Date();
        attempt.responseTimeSec = (attempt.respondedAt - attempt.sentAt) / 1000;
        await attempt.save();
      }

      // Update worker status and availability
      await WorkerModel.findByIdAndUpdate(workerId, { status: 'BUSY', availability: 'ON_JOB' });

      // Create timeline log
      await BookingTimeline.create({
        bookingId: id,
        status: 'worker_assigned',
        title: 'Technician Confirmed',
        message: 'A technician has accepted your request.',
        actorRole: 'worker',
        actorId: workerId
      });

      const { createNotification } = require('../notificationControllers/notificationController');

      // Notify Vendor
      if (booking.vendorId) {
        await createNotification({
          vendorId: booking.vendorId,
          type: 'job_accepted',
          title: 'Worker Accepted Job',
          message: `Worker has accepted job ${booking.bookingNumber}`,
          relatedId: booking._id,
          relatedType: 'booking'
        });
      }

      // Notify User
      await createNotification({
        userId: booking.userId,
        type: 'worker_accepted',
        title: 'Worker Confirmed',
        message: 'The assigned professional has accepted your booking.',
        relatedId: booking._id,
        relatedType: 'booking',
        priority: 'high',
        pushData: { type: 'worker_accepted', bookingId: booking._id.toString(), link: `/user/booking/${booking._id}` }
      });

      // Emit live updates
      const io = getIO();
      if (io) {
        io.to(`booking_${id}`).emit('booking:workerAccepted', {
          message: 'Technician confirmed!',
          workerId: workerId
        });
        io.to('admin:wbi').emit('admin:workerAccepted', { bookingId: id, workerId });
      }

    } else if (status === 'REJECTED') {
      // If worker rejects, update attempt status to rejected
      const attempt = await WorkerAssignmentAttempt.findOne({ bookingId: id, workerId, status: 'sent' });
      if (attempt) {
        attempt.status = 'rejected';
        attempt.respondedAt = new Date();
        attempt.responseTimeSec = (attempt.respondedAt - attempt.sentAt) / 1000;
        await attempt.save();
      }

      console.log(`[WORKER_REJECTED] Booking: ${id}, Worker: ${workerId}`);

      // Immediately trigger matching continuation
      const matchingService = require('../../services/matchingService');
      matchingService.continueMatching(id).catch(err => {
         console.error('[WorkerBookingController] Error continuing matching:', err);
      });

      const { createNotification } = require('../notificationControllers/notificationController');
      if (booking.vendorId) {
        await createNotification({
          vendorId: booking.vendorId,
          type: 'job_rejected',
          title: 'Worker Declined Job',
          message: `Worker declined job ${booking.bookingNumber}`,
          relatedId: booking._id,
          relatedType: 'booking'
        });
      }
    }

    res.status(200).json({ success: true, message: `Job ${status.toLowerCase()}`, data: booking });

  } catch (error) {
    console.error('Respond job error:', error);
    res.status(500).json({ success: false, message: 'Failed to respond to job' });
  }
};

/**
 * Upload Job Media (Before/After Photos, Videos)
 */
const uploadJobMedia = async (req, res) => {
  try {
    const workerId = req.user.id;
    const { id } = req.params;
    const { workPhotos, progressVideos } = req.body;

    const booking = await Booking.findOne({ _id: id, workerId });
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    if (workPhotos && Array.isArray(workPhotos)) {
      booking.workPhotos = [...(booking.workPhotos || []), ...workPhotos];
    }
    if (progressVideos && Array.isArray(progressVideos)) {
      booking.progressVideos = [...(booking.progressVideos || []), ...progressVideos];
    }

    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Media uploaded successfully',
      data: booking
    });
  } catch (error) {
    console.error('Upload job media error:', error);
    res.status(500).json({ success: false, message: 'Failed to upload media' });
  }
};

/**
 * Add Job Materials
 */
const addJobMaterials = async (req, res) => {
  try {
    const workerId = req.user.id;
    const { id } = req.params;
    const { materials } = req.body;

    if (!materials || !Array.isArray(materials)) {
      return res.status(400).json({ success: false, message: 'Materials array is required' });
    }

    const booking = await Booking.findOne({ _id: id, workerId });
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    booking.materials = [...(booking.materials || []), ...materials];
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Materials added successfully',
      data: booking
    });
  } catch (error) {
    console.error('Add job materials error:', error);
    res.status(500).json({ success: false, message: 'Failed to add materials' });
  }
};

/**
 * Get Job Timeline
 */
const getJobTimeline = async (req, res) => {
  try {
    const workerId = req.user.id;
    const { id } = req.params;

    const booking = await Booking.findOne({ _id: id, workerId })
      .select('assignedAt workerAcceptedAt journeyStartedAt visitedAt startedAt completedAt cancelledAt status');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    const timeline = [];
    if (booking.assignedAt) timeline.push({ title: 'Assigned', time: booking.assignedAt });
    if (booking.workerAcceptedAt) timeline.push({ title: 'Accepted', time: booking.workerAcceptedAt });
    if (booking.journeyStartedAt) timeline.push({ title: 'Journey Started', time: booking.journeyStartedAt });
    if (booking.visitedAt) timeline.push({ title: 'Arrived', time: booking.visitedAt });
    if (booking.startedAt) timeline.push({ title: 'Work Started', time: booking.startedAt });
    if (booking.completedAt) timeline.push({ title: 'Work Completed', time: booking.completedAt });
    if (booking.cancelledAt) timeline.push({ title: 'Cancelled', time: booking.cancelledAt });

    // Sort chronologically
    timeline.sort((a, b) => new Date(a.time) - new Date(b.time));

    res.status(200).json({
      success: true,
      data: timeline
    });
  } catch (error) {
    console.error('Get job timeline error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch timeline' });
  }
};

/**
 * Get Job Progress Aggregated Data
 */
const getJobProgress = async (req, res) => {
  try {
    const workerId = req.user.id;
    const { id } = req.params;

    const booking = await Booking.findOne({ _id: id, workerId })
      .populate('userId', 'name phone email')
      .populate('serviceId', 'title')
      .populate('categoryId', 'title');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    // Build timeline for progress
    const timeline = [];
    if (booking.assignedAt) timeline.push({ status: 'Assigned', timestamp: booking.assignedAt });
    if (booking.workerAcceptedAt) timeline.push({ status: 'Accepted', timestamp: booking.workerAcceptedAt });
    if (booking.journeyStartedAt) timeline.push({ status: 'Arrived', timestamp: booking.journeyStartedAt }); // or visitedAt
    if (booking.startedAt) timeline.push({ status: 'In Progress', timestamp: booking.startedAt });
    if (booking.completedAt) timeline.push({ status: 'Completed', timestamp: booking.completedAt });

    timeline.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    res.status(200).json({
      success: true,
      data: {
        job: booking,
        timeline
      }
    });
  } catch (error) {
    console.error('Get job progress error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch job progress' });
  }
};

/**
 * Add Job Expenses
 */
const addJobExpenses = async (req, res) => {
  try {
    const workerId = req.user.id;
    const { id } = req.params;
    const { expenses } = req.body;

    if (!expenses || !Array.isArray(expenses)) {
      return res.status(400).json({ success: false, message: 'Expenses array is required' });
    }

    const booking = await Booking.findOne({ _id: id, workerId });
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    booking.expenses = [...(booking.expenses || []), ...expenses];
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Expenses added successfully',
      data: booking
    });
  } catch (error) {
    console.error('Add job expenses error:', error);
    res.status(500).json({ success: false, message: 'Failed to add expenses' });
  }
};

/**
 * Get Job Report
 */
const getJobReport = async (req, res) => {
  try {
    const workerId = req.user.id;
    const { id } = req.params;

    const booking = await Booking.findOne({ _id: id, workerId })
      .populate('userId', 'name phone email')
      .populate('workerId', 'name phone')
      .populate('serviceId', 'title');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error('Get job report error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch job report' });
  }
};

/**
 * Get Job Completion Details
 */
const getJobCompletionDetails = async (req, res) => {
  try {
    const workerId = req.user.id;
    const { id } = req.params;

    const booking = await Booking.findOne({ _id: id, workerId })
      .populate('userId', 'name phone email address')
      .populate('serviceId', 'title')
      .populate('categoryId', 'title');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    const VendorBill = require('../../models/VendorBill');
    const vendorBill = await VendorBill.findOne({ bookingId: id });

    // Assuming worker's explicit earning isn't stored, we fallback to bill grandTotal or booking finalAmount
    const earnedAmount = vendorBill ? vendorBill.grandTotal : (booking.finalAmount || 0);

    // Calculate duration
    let duration = 'N/A';
    if (booking.startedAt && booking.completedAt) {
      const diffMs = new Date(booking.completedAt) - new Date(booking.startedAt);
      const diffMins = Math.round(diffMs / 60000);
      const hours = Math.floor(diffMins / 60);
      const mins = diffMins % 60;
      duration = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
    }

    res.status(200).json({
      success: true,
      data: {
        booking,
        vendorBill,
        earnedAmount,
        duration
      }
    });
  } catch (error) {
    console.error('Get job completion error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch job completion details' });
  }
};

/**
 * Share Job Report
 */
const shareJobReport = async (req, res) => {
  try {
    const workerId = req.user.id;
    const { id } = req.params;

    const booking = await Booking.findOne({ _id: id, workerId }).populate('serviceId', 'title');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    const shareText = `WBI Job Completed!\n\nService: ${booking.serviceName || booking.serviceId?.title}\nBooking ID: ${booking.bookingNumber}\nCompleted On: ${booking.completedAt ? new Date(booking.completedAt).toLocaleDateString() : 'N/A'}\nTotal Value: ₹${booking.finalAmount}\n\nThank you for choosing WBI!`;

    res.status(200).json({
      success: true,
      data: { shareText }
    });
  } catch (error) {
    console.error('Share job report error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate share text' });
  }
};

/**
 * Accept a broadcasted one-time job
 * Similar to how vendors accept jobs from users
 */
const acceptBroadcastJob = async (req, res) => {
  try {
    const workerId = req.user.id;
    const { id } = req.params;

    // ATOMIC UPDATE: Check status and workerId/vendorId in query to prevent race conditions
    // Accept if status is requested, searching, searching_worker, or request_sent, and no worker/vendor assigned
    const updatedBooking = await Booking.findOneAndUpdate(
      {
        _id: id,
        status: { $in: [BOOKING_STATUS.REQUESTED, BOOKING_STATUS.SEARCHING, BOOKING_STATUS.SEARCHING_WORKER, BOOKING_STATUS.REQUEST_SENT] },
        workerId: null,
        vendorId: null
      },
      {
        $set: {
          workerId: workerId,
          acceptedAt: new Date(),
          workerAcceptedAt: new Date(),
          status: BOOKING_STATUS.WORKER_ASSIGNED, // Standardized worker_assigned status
          workerResponse: 'ACCEPTED'
        }
      },
      { new: true } // Return updated doc
    );

    if (!updatedBooking) {
      // If update failed, check why (likely already taken)
      const existing = await Booking.findById(id);
      if (existing && (existing.workerId || existing.vendorId)) {
        return res.status(409).json({
          success: false,
          message: 'Sorry, this job has already been accepted by someone else.'
        });
      }
      return res.status(400).json({
        success: false,
        message: 'Job is no longer available.'
      });
    }

    const booking = updatedBooking;

    // Update assignment attempt if exists
    const WorkerAssignmentAttempt = require('../../models/WorkerAssignmentAttempt');
    const attempt = await WorkerAssignmentAttempt.findOne({ bookingId: id, workerId, status: 'sent' });
    if (attempt) {
      attempt.status = 'accepted';
      attempt.respondedAt = new Date();
      attempt.responseTimeSec = (attempt.respondedAt - attempt.sentAt) / 1000;
      await attempt.save();
    }

    // Set worker status to busy
    const WorkerModel = require('../../models/Worker');
    await WorkerModel.findByIdAndUpdate(workerId, { status: 'BUSY', availability: 'ON_JOB' });

    // Create timeline log
    const BookingTimeline = require('../../models/BookingTimeline');
    await BookingTimeline.create({
      bookingId: id,
      status: 'worker_assigned',
      title: 'Technician Confirmed',
      message: 'A technician has accepted the broadcast request.',
      actorRole: 'worker',
      actorId: workerId
    });


    // Update BookingRequest statuses if exists
    const BookingRequest = require('../../models/BookingRequest');
    await BookingRequest.findOneAndUpdate(
      { bookingId: id, workerId },
      { status: 'ACCEPTED', respondedAt: new Date() }
    );
    await BookingRequest.updateMany(
      { bookingId: id, workerId: { $ne: workerId }, workerId: { $exists: true } },
      { status: 'EXPIRED', respondedAt: new Date() }
    );

    const { createNotification } = require('../notificationControllers/notificationController');

    // NOTIFY OTHER WORKERS to remove this job
    const io = req.app.get('io');
    if (io && booking.notifiedWorkers && booking.notifiedWorkers.length > 0) {
      booking.notifiedWorkers.forEach(otherWorkerId => {
        if (otherWorkerId.toString() !== workerId.toString()) {
          const room = `worker_${otherWorkerId.toString()}`;
          io.to(room).emit('job_taken', {
            bookingId: booking._id.toString(),
            message: 'This job has been accepted by someone else.'
          });
        }
      });
    }

    // Emit real-time updates to USER
    if (io) {
      // Notify tracking screens & admin panel
      io.to(`booking_${id}`).emit('booking:workerAccepted', {
        message: 'Technician confirmed!',
        workerId: workerId
      });
      io.to('admin:wbi').emit('admin:workerAccepted', { bookingId: id, workerId });

      const message = 'A professional has accepted your request. Your booking is confirmed!';
      io.to(`user_${booking.userId}`).emit('booking_accepted', {
        bookingId: booking._id,
        bookingNumber: booking.bookingNumber,
        worker: {
          id: workerId,
          name: req.user.name,
        },
        message
      });

      io.to(`user_${booking.userId}`).emit('booking_updated', {
        bookingId: booking._id,
        status: booking.status,
        message: 'A professional has accepted your request'
      });
    }

    // Send notification to user
    const notificationMessage = `Your booking ${booking.bookingNumber} is confirmed! ${req.user.name} will arrive at the scheduled time.`;
    await createNotification({
      userId: booking.userId,
      type: 'booking_accepted',
      title: 'Booking Confirmed!',
      message: notificationMessage,
      relatedId: booking._id,
      relatedType: 'booking',
      pushData: {
        type: 'booking_accepted',
        bookingId: booking._id.toString(),
        link: `/user/booking/${booking._id}`
      }
    });

    res.status(200).json({
      success: true,
      message: 'Job accepted successfully',
      data: booking
    });
  } catch (error) {
    console.error('Accept broadcast job error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to accept job. Please try again.'
    });
  }
};

module.exports = {
  acceptBroadcastJob,
  getAssignedJobs,
  getJobById,
  updateJobStatus,
  startJob,
  completeJob,
  addWorkerNotes,
  verifyVisit,
  workerReachedLocation,
  collectCash,
  respondToJob,
  uploadJobMedia,
  addJobMaterials,
  getJobTimeline,
  getJobProgress,
  addJobExpenses,
  getJobReport,
  getJobCompletionDetails,
  shareJobReport
};
