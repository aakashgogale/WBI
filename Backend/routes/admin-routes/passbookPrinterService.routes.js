const express = require('express');
const router = express.Router();
const passbookPrinterServiceController = require('../../controllers/passbookPrinterService.controller');
const { protect, authorize } = require('../../middlewares/auth');

// Protect all routes and restrict to admin/super_admin
router.use(protect);
router.use(authorize('admin', 'super_admin'));

router.get('/', passbookPrinterServiceController.getEnquiries);
router.get('/:id', passbookPrinterServiceController.getEnquiry);
router.put('/:id/status', passbookPrinterServiceController.updateStatus);
router.delete('/:id', passbookPrinterServiceController.deleteEnquiry);

module.exports = router;
