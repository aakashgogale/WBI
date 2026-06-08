const express = require('express');
const router = express.Router();
const posServiceController = require('../../controllers/posService.controller');
const { protect, authorize } = require('../../middlewares/auth');

// Protect all routes and restrict to admin/super_admin
router.use(protect);
router.use(authorize('admin', 'super_admin'));

router.get('/', posServiceController.getEnquiries);
router.get('/:id', posServiceController.getEnquiry);
router.put('/:id/status', posServiceController.updateStatus);
router.delete('/:id', posServiceController.deleteEnquiry);

module.exports = router;
