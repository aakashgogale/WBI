const express = require('express');
const router = express.Router();
const serviceCategoryController = require('../../controllers/publicControllers/serviceCategoryController');

router.get('/', serviceCategoryController.getPublicServiceCategories);
router.get('/slug/:slug', serviceCategoryController.getCategoryBySlug);
router.get('/:slug/services', serviceCategoryController.getCategorySubServices);

module.exports = router;
