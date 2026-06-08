const express = require('express');
const router = express.Router();
const subServiceController = require('../../controllers/adminControllers/subServiceController');

// All routes are protected by admin auth middleware in server.js
router.get('/', subServiceController.getAllSubServices);
router.post('/', subServiceController.createSubService);
router.put('/:id', subServiceController.updateSubService);
router.delete('/:id', subServiceController.deleteSubService);
router.patch('/:id/status', subServiceController.toggleSubServiceStatus);

module.exports = router;
