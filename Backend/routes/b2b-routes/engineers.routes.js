const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/authMiddleware');
const { isApprovedB2B } = require('../../middleware/roleMiddleware');
const b2bEngineerController = require('../../controllers/b2bControllers/b2bEngineerController');

router.use(authenticate);
router.use(isApprovedB2B);

router.get('/stats', b2bEngineerController.getStats);
router.get('/export', b2bEngineerController.exportEngineers);
router.get('/live', b2bEngineerController.getLiveTracking);

router.get('/', b2bEngineerController.getEngineers);
router.get('/:engineerId', b2bEngineerController.getEngineerDetails);
router.get('/:engineerId/current-job', b2bEngineerController.getCurrentJob);
router.get('/:engineerId/performance', b2bEngineerController.getPerformance);
router.get('/:engineerId/timeline', b2bEngineerController.getTimeline);

module.exports = router;
