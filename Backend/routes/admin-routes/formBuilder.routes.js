const express = require('express');
const router = express.Router();
const {
  getProfileFields,
  createProfileField,
  updateProfileField,
  deleteProfileField,
  getFormConfigs,
  createFormConfig,
  updateFormConfig,
  deleteFormConfig
} = require('../../controllers/adminControllers/formBuilder.controller');
const { authenticate } = require('../../middleware/authMiddleware');
const { isAdmin } = require('../../middleware/roleMiddleware');

// Protect and authorize all routes to ADMIN
router.use(authenticate);
router.use(isAdmin);

// Profile Fields Routes
router.route('/profile-fields')
  .get(getProfileFields)
  .post(createProfileField);

router.route('/profile-fields/:id')
  .put(updateProfileField)
  .delete(deleteProfileField);

// Form Configs Routes
router.route('/form-configs')
  .get(getFormConfigs)
  .post(createFormConfig);

router.route('/form-configs/:id')
  .put(updateFormConfig)
  .delete(deleteFormConfig);

module.exports = router;
