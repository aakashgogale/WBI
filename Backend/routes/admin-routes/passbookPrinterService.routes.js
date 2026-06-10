const express = require('express');
const router = express.Router();
const passbookPrinterServiceController = require('../../controllers/passbookPrinterService.controller');
const { authenticate } = require('../../middleware/authMiddleware');
const { isAdmin } = require('../../middleware/roleMiddleware');

// Protect all routes and restrict to admin
router.use(authenticate);
router.use(isAdmin);

router.get('/', passbookPrinterServiceController.getEnquiries);
router.get('/:id', passbookPrinterServiceController.getEnquiry);
router.put('/:id/status', passbookPrinterServiceController.updateStatus);
router.delete('/:id', passbookPrinterServiceController.deleteEnquiry);

module.exports = router;
