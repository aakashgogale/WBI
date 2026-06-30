const mongoose = require('mongoose');
const Banner = require('../../models/Banner');
const fs = require('fs');
const path = require('path');
const { delCache } = require('../../services/redisService');
const logFile = path.join(__dirname, '../../debug.log');
const log = (msg) => {
  try {
    fs.appendFileSync(logFile, `[${new Date().toISOString()}] ${msg}\n`);
  } catch (err) {
    console.error('Failed to write log:', err);
  }
};

// @desc    Get all banners
// @route   GET /api/admin/banners
// @access  Private/Admin
const getBanners = async (req, res) => {
  try {
    const { bannerType, isActive } = req.query;
    log(`getBanners: query=${JSON.stringify(req.query)} Connected to DB Host: ${mongoose.connection.host} DB Name: ${mongoose.connection.name}`);
    const query = {};
    if (bannerType) query.bannerType = bannerType;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    query.isDeleted = { $ne: true };

    const banners = await Banner.find(query).sort({ sortOrder: 1, createdAt: -1 });
    log(`getBanners: Found banners count: ${banners.length} - ${JSON.stringify(banners.map(b => ({ id: b._id, title: b.title })))}`);

    res.status(200).json({
      success: true,
      count: banners.length,
      data: banners
    });
  } catch (error) {
    log(`getBanners Error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get single banner
// @route   GET /api/admin/banners/:id
// @access  Private/Admin
const getBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);

    if (!banner) {
      return res.status(404).json({ success: false, message: 'Banner not found' });
    }

    res.status(200).json({
      success: true,
      data: banner
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Create new banner
// @route   POST /api/admin/banners
// @access  Private/Admin
const createBanner = async (req, res) => {
  try {
    console.log('[ADMIN_BANNER_SAVE_START] Creating a new banner');
    const banner = await Banner.create(req.body);

    console.log('[ADMIN_BANNER_SAVE_SUCCESS] Banner created successfully. ID: ' + banner._id);
    console.log('[ADMIN_BANNER_IMAGE_URL] Image URL: ' + banner.imageUrl);

    // Invalidate Redis cache
    await delCache('home_data:*');

    res.status(201).json({
      success: true,
      data: banner
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Update banner
// @route   PUT /api/admin/banners/:id
// @access  Private/Admin
const updateBanner = async (req, res) => {
  try {
    console.log('[ADMIN_BANNER_SAVE_START] Updating banner ID: ' + req.params.id);
    let banner = await Banner.findById(req.params.id);

    if (!banner) {
      return res.status(404).json({ success: false, message: 'Banner not found' });
    }

    banner = await Banner.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    console.log('[ADMIN_BANNER_SAVE_SUCCESS] Banner updated successfully. ID: ' + req.params.id);
    console.log('[ADMIN_BANNER_IMAGE_URL] Image URL: ' + banner.imageUrl);

    // Invalidate Redis cache
    await delCache('home_data:*');

    res.status(200).json({
      success: true,
      data: banner
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Delete banner
// @route   DELETE /api/admin/banners/:id
// @access  Private/Admin
const deleteBanner = async (req, res) => {
  try {
    log(`deleteBanner: ID to delete: ${req.params.id} Connected to DB Host: ${mongoose.connection.host} DB Name: ${mongoose.connection.name}`);
    const banner = await Banner.findById(req.params.id);

    if (!banner) {
      log(`deleteBanner: Banner NOT found in DB for ID: ${req.params.id}`);
      return res.status(404).json({ success: false, message: 'Banner not found' });
    }

    banner.isDeleted = true;
    banner.deletedAt = new Date();
    await banner.save();
    log(`deleteBanner: Banner deleted successfully: ${req.params.id}`);

    // Invalidate Redis cache
    await delCache('home_data:*');

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    log(`deleteBanner Error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Update banner sort order
// @route   PATCH /api/admin/banners/order
// @access  Private/Admin
const updateBannerOrder = async (req, res) => {
  try {
    const { items } = req.body;
    
    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ success: false, message: 'Please provide items array' });
    }

    const updates = items.map((item, index) => {
      return Banner.findByIdAndUpdate(item.id, { sortOrder: index });
    });

    await Promise.all(updates);

    // Invalidate Redis cache
    await delCache('home_data:*');

    res.status(200).json({
      success: true,
      message: 'Order updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

module.exports = {
  getBanners,
  getBanner,
  createBanner,
  updateBanner,
  deleteBanner,
  updateBannerOrder
};
