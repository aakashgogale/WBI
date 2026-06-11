const express = require('express');
const router = express.Router();
const engineerJobExecutionController = require('../../controllers/engineerControllers/engineerJobExecution.controller');
const { authenticate } = require('../../middleware/authMiddleware');
const { isEngineer } = require('../../middleware/roleMiddleware');

router.use(authenticate);
router.use(isEngineer);

router.post('/work-orders/:workOrderId/respond', engineerJobExecutionController.respondToAssignment);
router.post('/work-orders/:workOrderId/status', engineerJobExecutionController.updateStatus);
router.post('/work-orders/:workOrderId/verify-otp', engineerJobExecutionController.verifyOtp);
router.post('/work-orders/:workOrderId/checklist/:taskId', engineerJobExecutionController.updateChecklistItem);
router.post('/work-orders/:workOrderId/complete', engineerJobExecutionController.completeJob);

module.exports = router;
