const express = require('express');
const router = express.Router();
const barcodeReaderServiceController = require('../../controllers/barcodeReaderService.controller');
const { protect, authorize } = require('../../middlewares/auth');

// Protect all routes and restrict to admin/super_admin
router.use(protect);
router.use(authorize('admin', 'super_admin'));

router.get('/', barcodeReaderServiceController.getEnquiries);
router.get('/:id', barcodeReaderServiceController.getEnquiry);
router.put('/:id/status', barcodeReaderServiceController.updateStatus);
router.delete('/:id', barcodeReaderServiceController.deleteEnquiry);

module.exports = router;
