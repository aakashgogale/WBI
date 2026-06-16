const express = require('express');
const router = express.Router();
const {
  getServiceDetails,
  getServiceBrands,
  getServiceIssues,
  getServicePackages,
  getServiceEstimate,
  getPricePreview
} = require('../../controllers/user/oneTimeServiceController');

// All these routes are public as users can browse before login
// For adding to cart, that will be handled by Cart routes

router.get('/:slug', getServiceDetails);
router.get('/:serviceId/brands', getServiceBrands);
router.get('/:serviceId/issues', getServiceIssues);
router.get('/:serviceId/packages', getServicePackages);
router.get('/:serviceId/estimate', getServiceEstimate);
router.post('/price-preview', getPricePreview);

module.exports = router;
