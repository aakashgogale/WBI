const express = require('express');
const router = express.Router();
const barcodeReaderServiceController = require('../../controllers/barcodeReaderService.controller');
const { authenticate } = require('../../middleware/authMiddleware');
const { isAdmin } = require('../../middleware/roleMiddleware');

// Protect all routes and restrict to admin
router.use(authenticate);
router.use(isAdmin);

router.get('/', barcodeReaderServiceController.getEnquiries);
router.get('/:id', barcodeReaderServiceController.getEnquiry);
router.put('/:id/status', barcodeReaderServiceController.updateStatus);
router.delete('/:id', barcodeReaderServiceController.deleteEnquiry);

module.exports = router;
