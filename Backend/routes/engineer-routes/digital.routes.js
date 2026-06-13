const express = require('express');
const router = express.Router();
const digitalJobController = require('../../controllers/engineerControllers/digitalJobController');
const digitalProjectController = require('../../controllers/engineerControllers/digitalProjectController');
const { authenticate } = require('../../middleware/authMiddleware');
const { isEngineer } = require('../../middleware/roleMiddleware');

// Secure all routes
router.use(authenticate, isEngineer);

// --- Digital Jobs ---
router.get('/jobs', digitalJobController.getEngineerJobs);
router.patch('/jobs/:id/accept', digitalJobController.acceptJob);
router.patch('/jobs/:id/reject', digitalJobController.rejectJob);

// --- Digital Projects ---
router.get('/projects', digitalProjectController.getEngineerProjects);
router.get('/projects/:projectId/milestones', digitalProjectController.getProjectMilestones);

module.exports = router;
