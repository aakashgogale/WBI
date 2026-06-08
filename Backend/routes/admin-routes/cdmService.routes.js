const express = require('express');
const router = express.Router();
const cdmServiceController = require('../../controllers/cdmService.controller');
const { protect, authorize } = require('../../middlewares/auth');

// Protect all routes and restrict to admin/super_admin
router.use(protect);
router.use(authorize('admin', 'super_admin'));

router.get('/', cdmServiceController.getEnquiries);
router.get('/:id', cdmServiceController.getEnquiry);
router.put('/:id/status', cdmServiceController.updateStatus);
router.delete('/:id', cdmServiceController.deleteEnquiry);

module.exports = router;
