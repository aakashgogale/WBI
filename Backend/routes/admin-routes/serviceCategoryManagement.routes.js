const express = require('express');
const router = express.Router();
const serviceCategoryController = require('../../controllers/adminControllers/serviceCategoryController');
const { authenticate, isAdmin } = require('../../middleware/authMiddleware'); // Admin protection can be added in server.js or here

router.route('/')
  .get(serviceCategoryController.getAllServiceCategories)
  .post(serviceCategoryController.createServiceCategory);

router.route('/:id')
  .put(serviceCategoryController.updateServiceCategory)
  .delete(serviceCategoryController.deleteServiceCategory);

router.route('/:id/status')
  .patch(serviceCategoryController.toggleServiceCategoryStatus);

module.exports = router;
