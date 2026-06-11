const express = require('express');
const router = express.Router();
const dynamicFormConfigController = require('../../controllers/adminControllers/dynamicFormConfig.controller');
const { authenticate } = require('../../middleware/authMiddleware');
const { isAdmin } = require('../../middleware/roleMiddleware');

router.use(authenticate);
router.use(isAdmin);

router.post('/', dynamicFormConfigController.createConfig);
router.get('/sub-service/:subServiceId', dynamicFormConfigController.getConfigBySubService);
router.put('/sub-service/:subServiceId', dynamicFormConfigController.updateConfig);

module.exports = router;
