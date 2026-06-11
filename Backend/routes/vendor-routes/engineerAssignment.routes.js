const express = require('express');
const router = express.Router();
const engineerAssignmentController = require('../../controllers/vendorControllers/engineerAssignment.controller');
const { authenticate } = require('../../middleware/authMiddleware');
const { isVendor } = require('../../middleware/roleMiddleware');

router.use(authenticate);
router.use(isVendor);

router.get('/work-orders/:workOrderId/engineers/ranked', engineerAssignmentController.getRankedEngineers);
router.post('/work-orders/:workOrderId/assign', engineerAssignmentController.assignEngineer);
router.post('/work-orders/:workOrderId/auto-assign', engineerAssignmentController.autoAssignEngineer);

module.exports = router;
