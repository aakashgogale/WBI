const express = require('express');
const router = express.Router();
const bookingAvailabilityController = require('../../controllers/user-controllers/bookingAvailability.controller');

router.get('/:draftId', bookingAvailabilityController.checkAvailability);

module.exports = router;
