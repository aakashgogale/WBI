const express = require('express');
const router = express.Router();
const bookingResponseController = require('../../controllers/worker-controllers/bookingResponse.controller');
const { authenticate } = require('../../middleware/authMiddleware');

router.patch('/:bookingId/accept', authenticate, bookingResponseController.acceptBooking);
router.patch('/:bookingId/reject', authenticate, bookingResponseController.rejectBooking);

module.exports = router;
