const Booking = require('../models/Booking');
const Worker = require('../models/Worker');
const WorkerAssignmentAttempt = require('../models/WorkerAssignmentAttempt');
const BookingTimeline = require('../models/BookingTimeline');
const BookingAssignmentConfig = require('../models/BookingAssignmentConfig');
const BookingAssignmentLog = require('../models/BookingAssignmentLog');
const ActiveWorkerSession = require('../models/ActiveWorkerSession');
const { getIO } = require('../sockets');
const Cart = require('../models/Cart');
const { createNotification } = require('../controllers/notificationControllers/notificationController');

class MatchingService {
  /**
   * Start the matching process for a new booking
   */
  async startMatching(bookingId) {
    try {
      const booking = await Booking.findById(bookingId).populate('serviceId subServiceId');
      if (!booking) throw new Error('Booking not found');

      // Check if there is a specific config for this service
      let config = await BookingAssignmentConfig.findOne({ serviceId: booking.serviceId?._id });
      if (!config) {
         // Default config fallback if none exists for this specific service
         config = await BookingAssignmentConfig.findOne({ serviceId: null });
         if (!config) {
            config = await BookingAssignmentConfig.create({ serviceId: null });
         }
      }

      const initialRadius = config.initialRadiusKm;

      // Update Booking status to searching_worker
      booking.status = 'searching_worker';
      await booking.save();

      // Log Timeline
      await BookingTimeline.create({
        bookingId: booking._id,
        status: 'searching_worker',
        title: 'Searching for nearby experts',
        message: 'System is looking for the best technician near your location.',
        actorRole: 'system'
      });

      await BookingAssignmentLog.create({
        bookingId: booking._id,
        action: 'Search Started',
        metadata: { initialRadius, center: { lat: booking.address?.lat, lng: booking.address?.lng } }
      });
      
      console.log(`[BOOKING_CREATED] Booking created successfully`);
      console.log(`[BOOKING_ID] ${booking._id}`);
      console.log(`[SERVICE_ID] ${booking.serviceId?._id || booking.serviceId}`);
      console.log(`[SUB_SERVICE_ID] ${booking.subServiceId?._id || booking.subServiceId}`);
      console.log(`[USER_LOCATION] Lat: ${booking.address?.lat}, Lng: ${booking.address?.lng}`);
      console.log(`[MATCHING_STARTED] Booking ID: ${booking._id}`);

      // Emit to user: Search Started
      const io = getIO();
      io.to(`booking_${bookingId}`).emit('booking:searchStarted', {
        status: 'searching_worker',
        message: 'Searching nearby experts...',
        radius: initialRadius,
        center: { lat: booking.address?.lat, lng: booking.address?.lng }
      });

      // Notify admin
      io.to('admin:wbi').emit('admin:bookingSearching', { bookingId: booking._id });

      // Set dynamic timeout for finding a worker
      const totalTimeoutSec = config.totalSearchTimeoutSec || 60;
      console.log(`[MatchingService] Scheduling overall search timeout of ${totalTimeoutSec}s for booking ${booking._id}`);
      setTimeout(async () => {
        try {
          await this.cancelAndRestoreToCart(booking._id, 'Search timeout: No technician accepted the request in time.');
        } catch (err) {
          console.error('[MatchingService] Error in overall search timeout handler:', err);
        }
      }, totalTimeoutSec * 1000);

      // Start the async matching logic in the background with a slight delay
      // This gives the frontend time to navigate to the searching screen and join the socket room
      setTimeout(() => {
        this.executeMatchingRound(booking, config, initialRadius, 1);
      }, 2000);
    } catch (error) {
      console.error('[MatchingService] Error starting match:', error);
    }
  }

  /**
   * Execute a round of matching within a specific radius
   */
  async executeMatchingRound(booking, config, radiusKm, roundNumber) {
    console.log(`[MatchingService] Round ${roundNumber} for Booking ${booking._id} at Radius ${radiusKm}km`);
    
    // Check if booking is still in 'searching_worker' status
    const currentBooking = await Booking.findById(booking._id);
    if (!currentBooking || currentBooking.status !== 'searching_worker') {
      console.log(`[MatchingService] Booking ${booking._id} is no longer searching.`);
      return; // Already accepted or cancelled
    }

    if (radiusKm > config.maxRadiusKm) {
      console.log(`[MatchingService] Max radius reached for booking ${booking._id}`);
      return this.handleNoWorkersFound(booking);
    }

    const { lat, lng } = booking.address;
    if (!lat || !lng) {
      console.error(`[MatchingService] Booking ${booking._id} lacks coordinates.`);
      return this.handleNoWorkersFound(booking);
    }

    // Find workers within radius
    const workers = await this.findEligibleWorkers(booking, lat, lng, radiusKm);

    // Filter out workers already contacted
    const previousAttempts = await WorkerAssignmentAttempt.find({ bookingId: booking._id }).select('workerId');
    const attemptedWorkerIds = previousAttempts.map(a => a.workerId.toString());
    
    const newWorkers = workers.filter(w => !attemptedWorkerIds.includes(w._id.toString()));

    if (newWorkers.length === 0) {
      // Expand radius and try next round after a delay to simulate scanning
      console.log(`[MatchingService] No new workers in round ${roundNumber}. Expanding radius.`);
      
      // Emit a scanning update so UI feels alive
      const io = getIO();
      io.to(`booking_${booking._id}`).emit('booking:radiusExpanded', {
        status: 'searching_worker',
        message: `Expanding search radius to ${radiusKm + config.radiusStepKm}km...`,
        radius: radiusKm + config.radiusStepKm
      });

      setTimeout(() => {
        this.executeMatchingRound(booking, config, radiusKm + config.radiusStepKm, roundNumber + 1);
      }, 3000); // 3 seconds delay per radar ping
      return;
    }

    const io = getIO();
    const workerLocations = newWorkers.map(w => ({
      id: w._id,
      name: w.name || w.firstName + ' ' + w.lastName,
      photo: w.profilePhoto,
      rating: w.rating || 4.5,
      completedJobs: w.completedJobs || 0,
      lat: w.location?.coordinates?.[1] || null,
      lng: w.location?.coordinates?.[0] || null,
      distance: radiusKm
    }));

    io.to(`booking_${booking._id}`).emit('booking:workersFound', {
      count: newWorkers.length,
      message: `${newWorkers.length} technicians found nearby`,
      workers: workerLocations
    });

    if (config.assignmentMode === 'broadcast') {
      await this.handleBroadcastMode(booking, newWorkers, config, radiusKm, roundNumber);
    } else {
      await this.handleSequentialMode(booking, newWorkers, config, radiusKm, roundNumber);
    }
  }

  async findEligibleWorkers(booking, lat, lng, radiusKm) {
    console.log(`[WORKERS_QUERY_STARTED] Booking: ${booking._id}, Radius: ${radiusKm}km`);
    
    // Find all workers within the search radius using 2dsphere index
    const workers = await Worker.find({
      location: {
        $nearSphere: {
          $geometry: {
            type: "Point",
            coordinates: [lng, lat]
          },
          $maxDistance: radiusKm * 1000 // meters
        }
      }
    });

    console.log(`[WORKERS_FOUND_RAW] Total found by location: ${workers.length}`);

    // Check for online workers who might be missing locations for debug purposes
    const onlineWorkersNoLocation = await Worker.find({
      status: 'ONLINE',
      $or: [
        { location: { $exists: false } },
        { 'location.coordinates': [0, 0] }
      ]
    });
    for (const w of onlineWorkersNoLocation) {
      console.log(`[WORKER_REJECTED_REASON] Worker: ${w._id}, Reason: location missing`);
      await BookingAssignmentLog.create({
        bookingId: booking._id,
        workerId: w._id,
        action: 'Worker Filtered',
        status: 'FAILED',
        reason: 'location missing'
      });
    }

    const eligibleWorkers = [];
    for (const worker of workers) {
      let isEligible = true;
      let rejectReason = '';

      if (!worker.isActive) {
        isEligible = false;
        rejectReason = 'inactive';
      } else if (worker.approvalStatus !== 'approved') {
        isEligible = false;
        rejectReason = 'unverified';
      } else if (worker.status === 'BUSY') {
        isEligible = false;
        rejectReason = 'busy';
      } else if (worker.status !== 'ONLINE') {
        isEligible = false;
        rejectReason = 'offline';
      } else {
        // Profile completeness check
        const isProfileIncomplete = (!worker.serviceCategories || worker.serviceCategories.length === 0) ||
          (!worker.address || !worker.address.city);
        if (isProfileIncomplete) {
          isEligible = false;
          rejectReason = 'profile incomplete';
        }
      }

      // Check Service Category & SubService matching
      if (isEligible && booking.serviceId) {
        const matchesSubService = worker.subServices?.some(s => s.subServiceId?.toString() === booking.subServiceId?._id?.toString() || s.subServiceId?.toString() === booking.subServiceId?.toString());
        
        const serviceTitle = booking.serviceId?.title || booking.serviceName || '';
        const matchesCategory = worker.serviceCategories?.some(cat => 
          cat.toLowerCase().trim() === serviceTitle.toLowerCase().trim() ||
          cat.toLowerCase().trim() === booking.serviceCategory?.toLowerCase().trim()
        );
        
        if (!matchesSubService && !matchesCategory) {
          isEligible = false;
          rejectReason = !matchesCategory ? 'service mismatch' : 'sub-service mismatch';
        }
      }

      if (isEligible && booking.vendorId && worker.vendorId?.toString() !== booking.vendorId.toString()) {
        isEligible = false;
        rejectReason = 'vendor mismatch';
      }

      if (!isEligible) {
        console.log(`[WORKER_REJECTED_REASON] Worker: ${worker._id}, Reason: ${rejectReason}`);
        await BookingAssignmentLog.create({
          bookingId: booking._id,
          workerId: worker._id,
          action: 'Worker Filtered',
          status: 'FAILED',
          reason: rejectReason
        });
      } else {
        eligibleWorkers.push(worker);
      }
    }

    console.log(`[WORKERS_ELIGIBLE] Eligible workers: ${eligibleWorkers.length}`);
    return eligibleWorkers.slice(0, 15);
  }

  async handleBroadcastMode(booking, workers, config, radiusKm, roundNumber) {
    const io = getIO();
    const selectedWorkers = workers.slice(0, config.maxWorkersPerRound);

    // Create Attempts
    for (const worker of selectedWorkers) {
      await WorkerAssignmentAttempt.create({
        bookingId: booking._id,
        workerId: worker._id,
        roundNumber,
        radiusKm,
        status: 'sent'
      });

      // Add worker to booking's notifiedWorkers to allow API authorization
      await Booking.findByIdAndUpdate(booking._id, {
        $addToSet: { notifiedWorkers: worker._id }
      });

      await BookingAssignmentLog.create({
        bookingId: booking._id,
        workerId: worker._id,
        action: 'Request Sent',
        status: 'SUCCESS',
        metadata: { roundNumber, radiusKm }
      });

      const payload = {
        bookingId: booking._id,
        orderId: booking.bookingNumber || booking._id,
        customerName: booking.userId?.name || 'Customer',
        customerPhoneMasked: booking.userId?.phone ? `+91 ******${String(booking.userId.phone).slice(-4)}` : '',
        serviceName: booking.serviceName || booking.serviceId?.name,
        brandName: booking.brandName,
        issueNames: booking.issueIds?.map(i => i.name) || [],
        packageNames: booking.packageIds?.map(p => p.name) || [],
        addressArea: booking.address?.city || booking.address?.area,
        fullAddress: booking.address?.addressLine1 || '',
        lat: booking.address?.lat,
        lng: booking.address?.lng,
        distanceKm: worker.distance || radiusKm,
        bookingType: booking.bookingType,
        scheduledDate: booking.scheduledDate,
        scheduledTime: booking.scheduledTime,
        totalAmount: booking.finalAmount,
        estimatedPayout: booking.finalAmount * 0.8,
        paymentMode: booking.paymentMethod,
        notes: booking.userNotes || '',
        acceptExpiresAt: new Date(Date.now() + config.workerResponseTimeoutSec * 1000).toISOString()
      };

      // Emit to worker specific room
      io.to(`worker:${worker._id}`).emit('worker:newBookingRequest', payload);
      console.log(`[REQUEST_SENT_TO_WORKER] Booking: ${booking._id}, Worker: ${worker._id}`);
      
      io.to('admin:wbi').emit('admin:workerRequestSent', { bookingId: booking._id, workerId: worker._id });
    }

    io.to(`booking_${booking._id}`).emit('booking:requestSentToWorker', {
      message: `Sending request to ${selectedWorkers.length} experts...`
    });

    // Set timeout to check if anyone accepted, if not, next round
    setTimeout(async () => {
      const updatedBooking = await Booking.findById(booking._id);
      if (updatedBooking.status === 'searching_worker') {
        // Mark all 'sent' as 'timeout'
        await WorkerAssignmentAttempt.updateMany(
          { bookingId: booking._id, roundNumber, status: 'sent' },
          { $set: { status: 'timeout' } }
        );
        io.to(`booking_${booking._id}`).emit('booking:assignmentTimeout', { message: 'Still searching... expanding search area' });
        
        // Trigger next round
        this.executeMatchingRound(booking, config, radiusKm + config.radiusStepKm, roundNumber + 1);
      }
    }, config.workerResponseTimeoutSec * 1000);
  }

  async handleSequentialMode(booking, workers, config, radiusKm, roundNumber) {
    const selectedWorkers = workers.slice(0, config.maxWorkersPerRound);
    
    // Start the sequential processing sequence
    this.processNextWorkerInSequence(booking, selectedWorkers, 0, config, radiusKm, roundNumber);
  }

  async processNextWorkerInSequence(booking, workersQueue, currentIndex, config, radiusKm, roundNumber) {
    const io = getIO();
    
    // Check if booking is still searching
    const currentBooking = await Booking.findById(booking._id);
    if (!currentBooking || currentBooking.status !== 'searching_worker') {
       return; // Already handled
    }

    // If queue is empty, move to next round
    if (currentIndex >= workersQueue.length) {
      io.to(`booking_${booking._id}`).emit('booking:assignmentTimeout', { message: 'Expanding search area...' });
      this.executeMatchingRound(booking, config, radiusKm + config.radiusStepKm, roundNumber + 1);
      return;
    }

    const worker = workersQueue[currentIndex];

    // Create attempt
    await WorkerAssignmentAttempt.create({
      bookingId: booking._id,
      workerId: worker._id,
      roundNumber,
      radiusKm,
      status: 'sent'
    });

    // Add worker to booking's notifiedWorkers to allow API authorization
    await Booking.findByIdAndUpdate(booking._id, {
      $addToSet: { notifiedWorkers: worker._id }
    });

    await BookingAssignmentLog.create({
      bookingId: booking._id,
      workerId: worker._id,
      action: 'Request Sent',
      status: 'SUCCESS',
      metadata: { roundNumber, radiusKm, mode: 'sequential' }
    });

    const payload = {
      bookingId: booking._id,
      orderId: booking.bookingNumber || booking._id,
      customerName: booking.userId?.name || 'Customer',
      customerPhoneMasked: booking.userId?.phone ? `+91 ******${String(booking.userId.phone).slice(-4)}` : '',
      serviceName: booking.serviceName || booking.serviceId?.name,
      brandName: booking.brandName,
      issueNames: booking.issueIds?.map(i => i.name) || [],
      packageNames: booking.packageIds?.map(p => p.name) || [],
      addressArea: booking.address?.city || booking.address?.area,
      fullAddress: booking.address?.addressLine1 || '',
      lat: booking.address?.lat,
      lng: booking.address?.lng,
      distanceKm: worker.distance || radiusKm,
      bookingType: booking.bookingType,
      scheduledDate: booking.scheduledDate,
      scheduledTime: booking.scheduledTime,
      totalAmount: booking.finalAmount,
      estimatedPayout: booking.finalAmount * 0.8,
      paymentMode: booking.paymentMethod,
      notes: booking.userNotes || '',
      acceptExpiresAt: new Date(Date.now() + config.workerResponseTimeoutSec * 1000).toISOString()
    };

    // Emit to worker
    io.to(`worker:${worker._id}`).emit('worker:newBookingRequest', payload);
    console.log(`[REQUEST_SENT_TO_WORKER] Booking: ${booking._id}, Worker: ${worker._id}`);
    
    io.to(`booking_${booking._id}`).emit('booking:requestSentToWorker', {
      message: `Request sent to best technician...`,
      workerId: worker._id
    });
    
    io.to('admin:wbi').emit('admin:workerRequestSent', { bookingId: booking._id, workerId: worker._id });

    // Wait for timeout or response
    setTimeout(async () => {
       const attempt = await WorkerAssignmentAttempt.findOne({ bookingId: booking._id, workerId: worker._id, status: 'sent' });
       if (attempt) {
          // Worker didn't respond in time
          attempt.status = 'timeout';
          await attempt.save();
          // Process next
          this.processNextWorkerInSequence(booking, workersQueue, currentIndex + 1, config, radiusKm, roundNumber);
       }
    }, config.workerResponseTimeoutSec * 1000);
  }

  async handleNoWorkersFound(booking) {
    console.log(`[MatchingService] Final: No workers found for booking ${booking._id}`);
    await this.cancelAndRestoreToCart(booking._id, 'No nearby technicians matched or accepted the request.');
  }

  /**
   * Atomically cancel search, restore items to cart, and send notifications
   */
  async cancelAndRestoreToCart(bookingId, reason) {
    try {
      const booking = await Booking.findOneAndUpdate(
        { _id: bookingId, status: 'searching_worker' },
        {
          $set: {
            status: 'cancelled',
            cancelledAt: new Date(),
            cancelledBy: 'system',
            cancellationReason: reason
          }
        },
        { new: true }
      );

      if (!booking) {
        console.log(`[MatchingService] Booking ${bookingId} is not in searching_worker status. Skipping timeout/failure cancellation.`);
        return;
      }

      console.log(`[ASSIGNMENT_FAILED] Booking ${booking._id} failed. Reason: ${reason}`);

      console.log(`[MatchingService] Booking ${booking._id} cancelled. Restoring items to cart for user ${booking.userId}`);

      // 1. Restore items to cart
      let cart = await Cart.findOne({ userId: booking.userId });
      if (!cart) {
        cart = new Cart({ userId: booking.userId, items: [] });
      }

      if (booking.bookedItems && booking.bookedItems.length > 0) {
        for (const item of booking.bookedItems) {
          const cartItem = {
            serviceId: booking.serviceId || null,
            categoryId: booking.categoryId || null,
            title: item.card?.title || item.serviceName || booking.serviceName || 'Service Item',
            description: item.card?.description || booking.description || '',
            icon: item.brandIcon || booking.categoryIcon || '',
            category: booking.serviceCategory || 'General',
            categoryTitle: booking.serviceCategory || '',
            categoryIcon: booking.categoryIcon || null,
            price: (item.card?.price || booking.basePrice || 0) * (item.quantity || 1),
            originalPrice: item.card?.originalPrice ? (item.card.originalPrice * (item.quantity || 1)) : null,
            unitPrice: item.card?.price || booking.basePrice || 0,
            serviceCount: item.quantity || 1,
            sectionTitle: item.brandName || booking.brandName || '',
            sectionIcon: item.brandIcon || booking.brandIcon || null,
            sectionId: null,
            card: item.card || null,
            vendorId: booking.vendorId || null
          };

          const existingItemIndex = cart.items.findIndex(
            i => i.serviceId?.toString() === cartItem.serviceId?.toString() && i.title === cartItem.title
          );

          if (existingItemIndex > -1) {
            cart.items[existingItemIndex].serviceCount += cartItem.serviceCount;
            cart.items[existingItemIndex].price += cartItem.price;
          } else {
            cart.items.push(cartItem);
          }
        }
        await cart.save();
        console.log(`[MatchingService] Successfully restored ${booking.bookedItems.length} items to user ${booking.userId}'s cart.`);
      }

      // 2. Timeline log
      await BookingTimeline.create({
        bookingId: booking._id,
        status: 'cancelled',
        title: 'Search Cancelled',
        message: 'We could not find a technician. Items have been restored to your cart.',
        actorRole: 'system'
      });

      // 3. User notifications (DB + Push)
      await createNotification({
        userId: booking.userId,
        type: 'booking_cancelled',
        title: 'Search timed out / failed',
        message: 'No technician available right now. Your request was cancelled and items returned to cart.',
        relatedId: booking._id,
        relatedType: 'booking',
        pushData: {
          type: 'booking_cancelled',
          bookingId: booking._id.toString(),
          link: `/user/cart`
        }
      });

      // 4. Sockets
      const io = getIO();
      if (io) {
        io.to(`booking_${booking._id}`).emit('booking:noWorkerAvailable', {
          message: 'No technician available right now. Items restored to cart.',
          bookingId: booking._id
        });
        
        // Notify admin panel
        io.to('admin:wbi').emit('admin:assignmentFailed', { bookingId: booking._id });
      }
    } catch (error) {
      console.error('[MatchingService] Error in cancelAndRestoreToCart:', error);
    }
  }

  /**
   * Continue matching immediately (e.g. after a worker rejects)
   */
  async continueMatching(bookingId) {
    try {
      const booking = await Booking.findById(bookingId).populate('serviceId subServiceId');
      if (!booking || booking.status !== 'searching_worker') {
        return;
      }

      // Check if there is a specific config for this service
      let config = await BookingAssignmentConfig.findOne({ serviceId: booking.serviceId?._id });
      if (!config) {
         config = await BookingAssignmentConfig.findOne({ serviceId: null });
         if (!config) {
            config = await BookingAssignmentConfig.create({ serviceId: null });
         }
      }

      const lastAttempt = await WorkerAssignmentAttempt.findOne({ bookingId }).sort({ createdAt: -1 });
      if (!lastAttempt) {
        // If no attempts exist, start fresh
        return this.executeMatchingRound(booking, config, config.initialRadiusKm, 1);
      }

      const currentRound = lastAttempt.roundNumber;

      // Check if there are any other 'sent' attempts in this round
      const activeAttempts = await WorkerAssignmentAttempt.countDocuments({
        bookingId,
        roundNumber: currentRound,
        status: 'sent'
      });

      if (activeAttempts > 0) {
        console.log(`[MatchingService] Still waiting for ${activeAttempts} workers in round ${currentRound}.`);
        return;
      }

      console.log(`[MatchingService] No active attempts left in round ${currentRound}. Proceeding immediately.`);
      
      const currentRadius = lastAttempt.radiusKm;
      // Trigger the next round (executeMatchingRound handles expanding the radius if needed)
      this.executeMatchingRound(booking, config, currentRadius, currentRound);
    } catch (error) {
      console.error('[MatchingService] Error in continueMatching:', error);
    }
  }
}

module.exports = new MatchingService();
