const { Worker } = require('bullmq');
const { redisConnection } = require('./queueSetup');
const Booking = require('../models/Booking');
const { findNearbyVendors, findNearbyWorkers } = require('../services/locationService');
const { getIO } = require('../sockets');
const { createNotification } = require('../controllers/notificationControllers/notificationController');

const bookingDispatchWorker = new Worker('booking-dispatch', async (job) => {
  console.log(`[bookingDispatchWorker] Processing auto-escalation for booking ${job.data.bookingId}`);
  try {
    const { bookingId } = job.data;
    
    // Use populate to get related details
    const booking = await Booking.findById(bookingId)
      .populate('userId', 'name phone email')
      .populate('serviceId', 'title iconUrl')
      .populate('categoryId', 'title slug providerType');

    if (!booking) {
      console.log(`[bookingDispatchWorker] Booking ${bookingId} not found. Exiting.`);
      return;
    }

    // Check if the booking is still pending admin action
    if (booking.status.toLowerCase() !== 'pending') {
      console.log(`[bookingDispatchWorker] Booking ${bookingId} has status ${booking.status}. No auto-escalation needed.`);
      return;
    }

    console.log(`[bookingDispatchWorker] Auto-escalating booking ${bookingId} as admin did not assign.`);

    // Transition to searching mode
    booking.status = 'SEARCHING';
    booking.adminApprovalStatus = 'auto_assigned';
    booking.adminLog.push({
      action: 'Auto-Escalated',
      reason: 'Admin timer expired without manual assignment. System is taking over.',
      timestamp: new Date()
    });
    
    // Find nearby workers/vendors
    const address = booking.address || {};
    const centerLocation = { 
      lat: address.lat || address.location?.coordinates?.[1] || address.latitude, 
      lng: address.lng || address.location?.coordinates?.[0] || address.longitude 
    };
    const radiusKm = 20; // Expanded radius for auto-escalation
    const providerType = booking.categoryId?.providerType || 'vendor';

    let providers = [];
    if (providerType === 'worker' || providerType === 'both') {
      const workers = await findNearbyWorkers(centerLocation, radiusKm, {
        service: booking.serviceCategory || booking.categoryId?.title
      });
      providers = workers.map(w => ({ ...w, type: 'worker' }));
    }

    if (providers.length === 0 && (providerType === 'vendor' || providerType === 'both')) {
      const vendors = await findNearbyVendors(centerLocation, radiusKm, {
        service: booking.serviceCategory || booking.categoryId?.title
      });
      providers = vendors.map(v => ({ ...v, type: 'vendor' }));
    }

    // Sort by distance
    providers.sort((a, b) => (a.distance || 0) - (b.distance || 0));

    // Get top 3
    const topProviders = providers.slice(0, 3);

    if (topProviders.length === 0) {
      console.warn(`[bookingDispatchWorker] NO PROVIDERS FOUND nearby for booking ${bookingId}`);
      booking.status = 'cancelled'; // or whatever the flow dictates
      await booking.save();
      return;
    }

    // Update booking with potential providers
    const notifiedWorkers = topProviders.filter(p => p.type === 'worker').map(p => p._id);
    const notifiedVendors = topProviders.filter(p => p.type === 'vendor').map(p => p._id);

    booking.notifiedWorkers = notifiedWorkers;
    booking.notifiedVendors = notifiedVendors;
    booking.waveStartedAt = new Date();
    await booking.save();

    console.log(`[bookingDispatchWorker] Emitting socket to ${notifiedWorkers.length} workers and ${notifiedVendors.length} vendors`);

    const io = getIO();
    if (io) {
      const bookingPayload = {
        bookingId: booking._id,
        serviceName: booking.serviceName || booking.serviceId?.title,
        customerName: booking.userId?.name,
        customerPhone: booking.userId?.phone,
        scheduledDate: booking.scheduledDate,
        scheduledTime: booking.scheduledTime,
        price: booking.finalAmount,
        address: booking.address,
        serviceCategory: booking.serviceCategory,
        brandName: booking.brandName,
        brandIcon: booking.brandIcon,
        categoryIcon: booking.categoryIcon,
        createdAt: booking.createdAt,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        playSound: true,
      };

      topProviders.forEach(provider => {
        const room = `${provider.type}_${provider._id.toString()}`;
        const eventName = provider.type === 'vendor' ? 'new_booking_request' : 'new_job_assigned';
        io.to(room).emit(eventName, {
          ...bookingPayload,
          distance: provider.distance,
          message: `Auto-Escalated request near you!`
        });
      });
    }

    // Notify User
    if (io) {
      io.to(`user_${booking.userId?._id}`).emit('booking_updated', {
        bookingId: booking._id,
        status: booking.status,
        message: 'Searching for nearby professionals...'
      });
    }

  } catch (error) {
    console.error('[bookingDispatchWorker] Error processing auto-escalation:', error);
  }
}, { connection: redisConnection });

bookingDispatchWorker.on('error', (err) => {
  console.error('[bookingDispatchWorker] ❌ Redis/Internal Error:', err.message);
});

module.exports = bookingDispatchWorker;
