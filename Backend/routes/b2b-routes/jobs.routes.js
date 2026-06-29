const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/authMiddleware');
const { isApprovedB2B } = require('../../middleware/roleMiddleware');
const b2bJobController = require('../../controllers/b2bControllers/b2bJobController');

// All routes require authentication and B2B approval
router.use(authenticate);
router.use(isApprovedB2B);

// Job Stats & Export (Must be placed before /:id routes)
router.get('/stats', b2bJobController.getStats);
router.get('/export', b2bJobController.exportJobs);

// Job Actions
router.post('/reassign', b2bJobController.reassignEngineer);

// Core CRUD and Job specific getters
router.get('/', b2bJobController.getJobs);
router.get('/:id', b2bJobController.getJobDetails);
router.patch('/:id', b2bJobController.updateJob);
router.delete('/:id', b2bJobController.cancelJob);

// Tracking and Timelines
router.get('/timeline/:id', b2bJobController.getJobTimeline);
router.get('/live/:id', b2bJobController.getLiveTracking);
router.get('/logs/:id', b2bJobController.getJobLogs);

module.exports = router;
