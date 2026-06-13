const express = require('express');
const router = express.Router();
const vendorDigitalController = require('../../controllers/vendorControllers/vendorDigitalController');
const { authenticate } = require('../../middleware/authMiddleware');
const { isVendor } = require('../../middleware/roleMiddleware');

router.use(authenticate, isVendor);

// --- Digital Jobs ---
router.post('/jobs/assign', vendorDigitalController.assignJobToEngineer);

module.exports = router;
