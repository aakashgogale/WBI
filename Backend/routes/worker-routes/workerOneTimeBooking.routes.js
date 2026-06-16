const express = require('express');
const router = express.Router();
const workerBookingController = require('../../controllers/bookingControllers/workerOneTimeBookingController');
const { authenticate } = require('../../middleware/authMiddleware');

// Note: authenticate attaches user to req.user

router.patch('/:id/respond', authenticate, workerBookingController.respondToBooking);
router.patch('/:id/status', authenticate, workerBookingController.updateBookingStatus);
router.post('/location/update', authenticate, workerBookingController.updateLiveLocation);
router.post('/:id/proofs', authenticate, workerBookingController.uploadProofs);
router.post('/:id/complete', authenticate, workerBookingController.completeBooking);

module.exports = router;
