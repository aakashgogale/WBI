const express = require('express');
const router = express.Router();

const { authenticate } = require('../../middleware/authMiddleware');
const { isAdmin } = require('../../middleware/roleMiddleware');
const b2bBulkJobAdminController = require('../../controllers/adminControllers/b2bBulkJobAdminController');

// Protect all routes under admin bulk jobs management
router.get('/bulk-jobs', authenticate, isAdmin, b2bBulkJobAdminController.getAllBatches);
router.get('/bulk-jobs/:batchId', authenticate, isAdmin, b2bBulkJobAdminController.getBatchDetails);
router.post('/bulk-jobs/:batchId/action', authenticate, isAdmin, b2bBulkJobAdminController.executeAction);

module.exports = router;
