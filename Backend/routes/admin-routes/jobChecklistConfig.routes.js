const express = require('express');
const router = express.Router();
const jobChecklistConfigController = require('../../controllers/adminControllers/jobChecklistConfig.controller');
const { authenticate } = require('../../middleware/authMiddleware');
const { isAdmin } = require('../../middleware/roleMiddleware');

router.use(authenticate);
router.use(isAdmin);

router.post('/', jobChecklistConfigController.createConfig);
router.get('/sub-service/:subServiceId', jobChecklistConfigController.getConfigBySubService);
router.put('/sub-service/:subServiceId', jobChecklistConfigController.updateConfig);

module.exports = router;
