const express = require('express');
const router = express.Router();
const { getPublicSettings } = require('../../controllers/adminControllers/settingsController');
const { getPublicFormConfig } = require('../../controllers/publicControllers/formConfig.controller');

router.get('/config', getPublicSettings);
router.get('/form-configs', getPublicFormConfig);

module.exports = router;
