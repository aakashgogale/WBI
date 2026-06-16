const express = require('express');
const router = express.Router();
const {
  createService,
  getServices,
  updateService,
  deleteService,
  createBrand,
  getBrandsByService,
  updateBrand,
  deleteBrand,
  createIssue,
  getIssuesByService,
  updateIssue,
  deleteIssue,
  createPackage,
  getPackagesByService,
  updatePackage,
  deletePackage,
  getPricingRule,
  updatePricingRule
} = require('../../controllers/admin/oneTimeServiceAdminController');

const { authenticate } = require('../../middleware/authMiddleware');
const { isAdmin } = require('../../middleware/roleMiddleware');

// Apply admin protection to all routes
router.use(authenticate);
router.use(isAdmin);

// ---------------------------
// OneTimeService Routes
// ---------------------------
router.route('/')
  .get(getServices)
  .post(createService);

router.route('/:id')
  .put(updateService)
  .delete(deleteService);

// ---------------------------
// ServiceBrand Routes
// ---------------------------
router.route('/:serviceId/brands')
  .get(getBrandsByService)
  .post(createBrand);

router.route('/brands/:id')
  .put(updateBrand)
  .delete(deleteBrand);

// ---------------------------
// ServiceIssue Routes
// ---------------------------
router.route('/:serviceId/issues')
  .get(getIssuesByService)
  .post(createIssue);

router.route('/issues/:id')
  .put(updateIssue)
  .delete(deleteIssue);

// ---------------------------
// ServicePackage Routes
// ---------------------------
router.route('/:serviceId/packages')
  .get(getPackagesByService)
  .post(createPackage);

router.route('/packages/:id')
  .put(updatePackage)
  .delete(deletePackage);

// ---------------------------
// ServicePricingRule Routes
// ---------------------------
router.route('/:serviceId/pricing-rule')
  .get(getPricingRule)
  .put(updatePricingRule);

module.exports = router;
