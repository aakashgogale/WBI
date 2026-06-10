const express = require('express');
const router = express.Router();
const cdmServiceController = require('../../controllers/cdmService.controller');
const { authenticate } = require('../../middleware/authMiddleware');
const { isAdmin } = require('../../middleware/roleMiddleware');

// Protect all routes and restrict to admin
router.use(authenticate);
router.use(isAdmin);

router.get('/', cdmServiceController.getEnquiries);
router.get('/:id', cdmServiceController.getEnquiry);
router.put('/:id/status', cdmServiceController.updateStatus);
router.delete('/:id', cdmServiceController.deleteEnquiry);

module.exports = router;
