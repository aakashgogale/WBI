const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/authMiddleware');
const { isWorker } = require('../../middleware/roleMiddleware');
const {
  getProjectCounts,
  getProjects,
  getProjectById,
  getProjectDocuments,
  getProjectPayments,
  getProjectTimeline,
  getProjectMilestones,
  getProjectProgress,
  submitMilestone,
  getMilestoneReviewStatus,
  getMilestoneById
} = require('../../controllers/workerControllers/workerProjectController');

// All project routes should be authenticated and require worker role
router.use(authenticate, isWorker);

// Get project counts
router.get('/counts', getProjectCounts);

// Get all projects for worker
router.get('/', getProjects);

// Get specific project details
router.get('/:projectId', getProjectById);

// Get specific project documents
router.get('/:projectId/documents', getProjectDocuments);

// Get specific project payments
router.get('/:projectId/payments', getProjectPayments);

// Get specific project timeline
router.get('/:projectId/timeline', getProjectTimeline);

// Get project milestones
router.get('/:projectId/milestones', getProjectMilestones);

// Get project progress stats
router.get('/:projectId/progress', getProjectProgress);

// Get specific milestone details
router.get('/:projectId/milestones/:milestoneId', getMilestoneById);

// Submit milestone
router.post('/:projectId/milestones/:milestoneId/submit', submitMilestone);

// Get milestone review status
router.get('/:projectId/milestones/:milestoneId/review', getMilestoneReviewStatus);

module.exports = router;
