const express = require('express');
const router = express.Router();
const vsatServiceController = require('../../controllers/vsatService.controller');
const { authenticate } = require('../../middleware/authMiddleware');
const { isAdmin } = require('../../middleware/roleMiddleware');

// Protect all routes and restrict to admin
router.use(authenticate);
router.use(isAdmin);

router.get('/', vsatServiceController.getEnquiries);
router.get('/:id', vsatServiceController.getEnquiry);
router.put('/:id/status', vsatServiceController.updateStatus);
router.delete('/:id', vsatServiceController.deleteEnquiry);

module.exports = router;
