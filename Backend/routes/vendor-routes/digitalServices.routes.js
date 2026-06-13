const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/authMiddleware');
const { isVendor } = require('../../middleware/roleMiddleware');
const { 
  getOverview, getCategoriesConfig, getServices, getRecentOrders, createService, updateService 
} = require('../../controllers/vendorControllers/vendorDigitalServices.controller');

router.get('/overview', authenticate, isVendor, getOverview);
router.get('/config', authenticate, isVendor, getCategoriesConfig); // Returns categories & valid statuses
router.get('/orders/recent', authenticate, isVendor, getRecentOrders);
router.get('/', authenticate, isVendor, getServices);
router.post('/', authenticate, isVendor, createService);
router.put('/:id', authenticate, isVendor, updateService);

module.exports = router;
