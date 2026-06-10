const express = require('express');
const router = express.Router();
const posServiceController = require('../../controllers/posService.controller');
const { authenticate } = require('../../middleware/authMiddleware');
const { isAdmin } = require('../../middleware/roleMiddleware');

// Protect all routes and restrict to admin
router.use(authenticate);
router.use(isAdmin);

router.get('/', posServiceController.getEnquiries);
router.get('/:id', posServiceController.getEnquiry);
router.put('/:id/status', posServiceController.updateStatus);
router.delete('/:id', posServiceController.deleteEnquiry);

module.exports = router;
