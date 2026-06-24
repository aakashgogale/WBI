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

router.get('/debug-db', async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const Banner = require('../../models/Banner');
    const banners = await Banner.find({});
    res.json({
      success: true,
      host: mongoose.connection.host,
      name: mongoose.connection.name,
      uri: process.env.MONGODB_URI ? process.env.MONGODB_URI.replace(/:([^:@]+)@/, ':***@') : null,
      bannersCount: banners.length,
      banners
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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
