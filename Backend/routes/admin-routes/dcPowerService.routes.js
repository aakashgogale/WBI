const express = require('express');
const router = express.Router();
const controller = require('../../controllers/dcPowerService.controller');
const { authenticate } = require('../../middleware/authMiddleware');
const { isAdmin } = require('../../middleware/roleMiddleware');

// Protect all routes and restrict to admin/super_admin
router.use(authenticate);
router.use(isAdmin);

router.get('/', controller.getEnquiries);
router.get('/:id', controller.getEnquiry);
router.put('/:id/status', controller.updateStatus);
router.delete('/:id', controller.deleteEnquiry);

module.exports = router;