const express = require('express');
const router = express.Router();
const vsatServiceController = require('../../controllers/vsatService.controller');
const { protect, authorize } = require('../../middlewares/auth');

// Protect all routes and restrict to admin/super_admin
router.use(protect);
router.use(authorize('admin', 'super_admin'));

router.get('/', vsatServiceController.getEnquiries);
router.get('/:id', vsatServiceController.getEnquiry);
router.put('/:id/status', vsatServiceController.updateStatus);
router.delete('/:id', vsatServiceController.deleteEnquiry);

module.exports = router;
