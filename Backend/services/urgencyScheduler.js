const cron = require('node-cron');
const Booking = require('../models/Booking');
const Engineer = require('../models/Engineer');
const { getIO } = require('../sockets');

// Run every minute
const startUrgencyScheduler = () => {
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      const thirtyMinsAgo = new Date(now.getTime() - 30 * 60000);
      const tenMinsAgo = new Date(now.getTime() - 10 * 60000);

      // Find timed out bookings (Batch of 50 to prevent memory bloat)
      const pendingBookings = await Booking.find({
        adminApprovalStatus: 'pending',
        $or: [
          { urgencyLevel: 'normal', urgencyTimerStartedAt: { $lte: thirtyMinsAgo } },
          { urgencyLevel: 'urgent', urgencyTimerStartedAt: { $lte: tenMinsAgo } },
          { urgencyLevel: { $exists: false }, urgencyTimerStartedAt: { $lte: thirtyMinsAgo } } // fallback
        ]
      }).limit(50);

      for (const booking of pendingBookings) {
        let shouldAutoAssign = true;
        let timeoutReason = booking.urgencyLevel === 'urgent' 
          ? 'Urgent request exceeded 10 mins admin timeout'
          : 'Normal request exceeded 30 mins admin timeout';

        if (shouldAutoAssign) {
          console.log(`[UrgencyScheduler] Auto-assigning booking ${booking.bookingNumber} (${timeoutReason})`);
          
          // Find best available worker (simplified for this context)
          // In production, you might use $near and filter by skills
          const bestWorker = await Engineer.findOne({
            status: 'ONLINE',
            isOnline: true
            // Add category/skill matching here based on booking.categoryId
          }).sort({ rating: -1, completedJobs: -1 });

          if (bestWorker) {
            // Assign to worker
            booking.adminApprovalStatus = 'auto_assigned';
            booking.workerId = bestWorker._id;
            // Optionally update booking status
            booking.adminLog.push({
              action: 'Auto-Assigned',
              reason: timeoutReason,
              timestamp: new Date()
            });

            await booking.save();

            // Notify Worker
            const io = getIO();
            if (io) {
              io.to(`worker_${bestWorker._id}`).emit('auto_assigned_job', {
                bookingId: booking._id,
                message: `You have been automatically assigned a new job: ${booking.bookingNumber}`
              });
            }
            // Add FCM Push here
            
            console.log(`[UrgencyScheduler] Successfully auto-assigned booking ${booking.bookingNumber} to Worker ${bestWorker._id}`);
          } else {
            // console.log(`[UrgencyScheduler] No available workers for auto-assigning booking ${booking.bookingNumber}`);
            booking.adminLog.push({
              action: 'Auto-Assign Failed',
              reason: 'No online workers found at timeout',
              timestamp: new Date()
            });
            booking.adminApprovalStatus = 'auto_assign_failed'; // Stop checking every minute
            await booking.save();
          }
        }
      }
    } catch (error) {
      console.error('[UrgencyScheduler] Error processing timeouts:', error);
    }
  });

  console.log('[UrgencyScheduler] Started cron job for 30m/10m timeouts');
};

module.exports = { startUrgencyScheduler };
