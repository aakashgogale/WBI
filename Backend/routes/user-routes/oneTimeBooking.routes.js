const express = require('express');
const router = express.Router();
const oneTimeBookingController = require('../../controllers/bookingControllers/oneTimeBookingController');
const { authenticate } = require('../../middleware/authMiddleware');

// Public routes for discovery
router.get('/services', oneTimeBookingController.getAvailableServices);

// Protected routes for booking
router.post('/create', authenticate, oneTimeBookingController.createBooking);
router.post('/draft', authenticate, oneTimeBookingController.createDraft);
router.put('/draft/:id', authenticate, oneTimeBookingController.updateDraft);
router.patch('/draft/:id/schedule', authenticate, oneTimeBookingController.scheduleDraft);
router.post('/reverse-geocode', authenticate, oneTimeBookingController.reverseGeocode);
router.get('/available-slots', authenticate, oneTimeBookingController.getAvailableSlots);
router.get('/available-dates', authenticate, oneTimeBookingController.getAvailableDates);
router.get('/workers', authenticate, oneTimeBookingController.findNearbyWorkers);
router.post('/:id/verify-otp', authenticate, oneTimeBookingController.verifyOTP);
router.post('/:id/rating', authenticate, oneTimeBookingController.rateBooking);

module.exports = router;
