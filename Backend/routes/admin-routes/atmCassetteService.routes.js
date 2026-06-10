const express = require('express');
const router = express.Router();
const atmCassetteServiceController = require('../../controllers/atmCassetteService.controller');
const { authenticate } = require('../../middleware/authMiddleware');
const { isAdmin } = require('../../middleware/roleMiddleware');

// Protect all routes and restrict to admin
router.use(authenticate);
router.use(isAdmin);

router.get('/', atmCassetteServiceController.getEnquiries);
router.get('/:id', atmCassetteServiceController.getEnquiry);
router.put('/:id/status', atmCassetteServiceController.updateStatus);
router.delete('/:id', atmCassetteServiceController.deleteEnquiry);

module.exports = router;
