const express = require('express');
const router = express.Router();
const atmCassetteServiceController = require('../../controllers/atmCassetteService.controller');
const { protect, authorize } = require('../../middlewares/auth');

// Protect all routes and restrict to admin/super_admin
router.use(protect);
router.use(authorize('admin', 'super_admin'));

router.get('/', atmCassetteServiceController.getEnquiries);
router.get('/:id', atmCassetteServiceController.getEnquiry);
router.put('/:id/status', atmCassetteServiceController.updateStatus);
router.delete('/:id', atmCassetteServiceController.deleteEnquiry);

module.exports = router;
