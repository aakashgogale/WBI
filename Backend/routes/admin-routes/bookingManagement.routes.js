const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { authenticate } = require('../../middleware/authMiddleware');
const { isAdmin } = require('../../middleware/roleMiddleware');
const {
  getAllBookings,
  getBookingById,
  cancelBooking,
  getBookingAnalytics,
  autoAssignProvider,
  getBookingMatchingStatus,
  assignWorker,
  reassignWorker,
  updateBookingStatus,
  addAdminNote,
  getBookingTimeline,
  getBookingLogs,
  getBookingPayment,
  paymentAction
} = require('../../controllers/bookingControllers/adminBookingController');

// Validation rules
const cancelBookingValidation = [
  body('cancellationReason').optional().trim()
];

// Routes
router.get('/bookings', authenticate, isAdmin, getAllBookings);
router.get('/bookings/analytics', authenticate, isAdmin, getBookingAnalytics);
router.get('/bookings/:id', authenticate, isAdmin, getBookingById);
router.post('/bookings/:id/cancel', authenticate, isAdmin, cancelBookingValidation, cancelBooking);
router.patch('/bookings/:id/cancel', authenticate, isAdmin, cancelBookingValidation, cancelBooking);

// Auto-assign provider (forces the auto-escalation queue to run immediately)
router.post('/bookings/:id/auto-assign', authenticate, isAdmin, autoAssignProvider);

// Real implemented admin actions
router.get('/bookings/:bookingId/timeline', authenticate, isAdmin, getBookingTimeline);
router.get('/bookings/:bookingId/matching', authenticate, isAdmin, getBookingMatchingStatus);
router.patch('/bookings/:bookingId/assign-worker', authenticate, isAdmin, assignWorker);
router.patch('/bookings/:bookingId/reassign-worker', authenticate, isAdmin, reassignWorker);
router.patch('/bookings/:bookingId/status', authenticate, isAdmin, updateBookingStatus);
router.post('/bookings/:bookingId/note', authenticate, isAdmin, addAdminNote);
router.get('/bookings/:bookingId/payment', authenticate, isAdmin, getBookingPayment);
router.patch('/bookings/:bookingId/payment-action', authenticate, isAdmin, paymentAction);
router.get('/bookings/:bookingId/logs', authenticate, isAdmin, getBookingLogs);

module.exports = router;
