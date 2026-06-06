const express = require('express');
const router = express.Router();
const serviceCategoryController = require('../../controllers/publicControllers/serviceCategoryController');

router.get('/', serviceCategoryController.getPublicServiceCategories);

module.exports = router;
