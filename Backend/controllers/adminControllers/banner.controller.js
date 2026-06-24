const Banner = require('../../models/Banner');

// @desc    Get all banners
// @route   GET /api/admin/banners
// @access  Private/Admin
const getBanners = async (req, res) => {
  try {
    const { bannerType, isActive } = req.query;
    const query = {};
    if (bannerType) query.bannerType = bannerType;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const banners = await Banner.find(query).sort({ sortOrder: 1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: banners.length,
      data: banners
    });
  } catch (error) {
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
    const banner = await Banner.create(req.body);

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
    let banner = await Banner.findById(req.params.id);

    if (!banner) {
      return res.status(404).json({ success: false, message: 'Banner not found' });
    }

    banner = await Banner.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

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
    const banner = await Banner.findById(req.params.id);

    if (!banner) {
      return res.status(404).json({ success: false, message: 'Banner not found' });
    }

    await banner.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
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
