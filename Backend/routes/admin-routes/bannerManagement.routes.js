const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/authMiddleware');
const { isAdmin, isSuperAdmin } = require('../../middleware/roleMiddleware');
const {
  getBanners,
  getBanner,
  createBanner,
  updateBanner,
  deleteBanner,
  updateBannerOrder
} = require('../../controllers/adminControllers/banner.controller');

router.use(authenticate);
router.use(isAdmin);

router.route('/')
  .get(getBanners)
  .post(createBanner);

router.route('/order')
  .patch(updateBannerOrder);

router.route('/:id')
  .get(getBanner)
  .put(updateBanner)
  .delete(deleteBanner);

module.exports = router;
