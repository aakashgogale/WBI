const express = require('express');
const router = express.Router();
const bookingResponseController = require('../../controllers/worker-controllers/bookingResponse.controller');
const { authenticate } = require('../../middleware/authMiddleware');
const bookingExecutionController = require('../../controllers/worker-controllers/bookingExecution.controller');

router.patch('/:bookingId/accept', authenticate, bookingResponseController.acceptBooking);
router.patch('/:bookingId/reject', authenticate, bookingResponseController.rejectBooking);

// Execution Flow
router.patch('/:bookingId/start-journey', authenticate, bookingExecutionController.startJourney);
router.patch('/:bookingId/arrived', authenticate, bookingExecutionController.arrived);
router.post('/:bookingId/verify-otp', authenticate, bookingExecutionController.verifyOtp);
router.post('/:bookingId/proofs', authenticate, bookingExecutionController.addProof);
router.patch('/:bookingId/complete', authenticate, bookingExecutionController.completeService);

module.exports = router;
