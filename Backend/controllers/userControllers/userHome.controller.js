const mongoose = require('mongoose');
const OneTimeService = require('../../models/OneTimeService');
const Banner = require('../../models/Banner');
const Notification = require('../../models/Notification');
const ServiceCategory = require('../../models/ServiceCategory');
const SubService = require('../../models/SubService');
const HomeSection = require('../../models/HomeSection');
const HomeContent = require('../../models/HomeContent');
const Brand = require('../../models/Brand');
// Import Cart logic if it's stored in DB, otherwise cart count might be handled purely frontend or different logic.
// Based on typical implementation, we might not fetch cart from DB if it's local storage, but assuming DB here if auth'd.

// @desc    Get dynamic User Home data
// @route   GET /api/user/home
// @access  Public/Private
const getHomeData = async (req, res) => {
  try {
    let { cityId } = req.query; // If needed for location-based filtering later
    if (!cityId || cityId === 'undefined' || cityId === 'null' || !mongoose.Types.ObjectId.isValid(cityId)) {
      cityId = null;
    }
    
    console.log('[USER_HOME_FETCH_START] Fetching user home data for cityId: ' + cityId);

    // Set headers to disable browser caching if supported
    if (res && typeof res.setHeader === 'function') {
      res.setHeader('Cache-Control', 'public, max-age=15, stale-while-revalidate=60');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }



    const now = new Date();
    // Helper query object to filter by active date range
    const activeDateFilter = {
      $and: [
        { $or: [{ startDate: null }, { startDate: { $lte: now } }] },
        { $or: [{ endDate: null }, { endDate: { $gte: now } }] }
      ]
    };

    // Run all independent queries concurrently
    const [
      quickServices,
      banners,
      offers,
      promos,
      mostBookedServices,
      popularBrands,
      sections,
      homeContentRes,
      categoriesRes,
      unreadNotifications
    ] = await Promise.all([
      // 1. Fetch active Quick Services
      OneTimeService.find({ isActive: true, categoryType: 'one_time' })
        .select('name slug image rating totalReviews startingPrice')
        .sort({ sortOrder: 1, createdAt: -1 })
        .limit(12)
        .lean(),
        
      // 2. Fetch Banners
      Banner.find({ isActive: true, isDeleted: { $ne: true }, bannerType: 'home_banner', ...activeDateFilter })
        .sort({ sortOrder: 1, createdAt: -1 }).lean(),
        
      // 3. Fetch Offers
      Banner.find({ isActive: true, isDeleted: { $ne: true }, bannerType: 'offer_banner', ...activeDateFilter })
        .sort({ sortOrder: 1, createdAt: -1 }).lean(),
        
      // 4. Fetch Promos
      Banner.find({ isActive: true, isDeleted: { $ne: true }, bannerType: 'promo_banner', ...activeDateFilter })
        .sort({ sortOrder: 1, createdAt: -1 }).lean(),
        
      // 5. Fetch Most Booked
      OneTimeService.find({ isActive: true, categoryType: 'one_time' })
        .select('name slug image rating totalReviews startingPrice')
        .sort({ rating: -1, totalReviews: -1 })
        .limit(10)
        .lean(),
        
      // 6. Fetch Popular Brands
      Brand.find({ 
        status: 'active', 
        $or: [{ isPopular: true }, { isFeatured: true }],
        ...(cityId ? { cityIds: { $in: [cityId, new mongoose.Types.ObjectId(cityId)] } } : { cityIds: { $exists: true } })
      })
      .select('title slug iconUrl logo imageUrl badge')
      .sort({ rating: -1, totalBookings: -1, createdAt: -1 })
      .limit(30)
      .lean(),
      
      // 7. Fetch Home Sections
      HomeSection.find({ isActive: true }).lean(),
      
      // 7b. Fetch Global Home Content config
      HomeContent.getHomeContent(cityId),
      
      // 8. Fetch Categories (merged from catalogController)
      ServiceCategory.find({ isActive: true, showOnApp: true })
        .select('name slug icon saleBadgeText')
        .sort({ displayOrder: 1 })
        .lean(),

      // 9. Unread Notifications
      req.user ? Notification.countDocuments({ user: req.user._id, isRead: false }) : Promise.resolve(0)
    ]);

    const carePlan = sections.find(s => s.sectionKey === 'care_plan') || null;
    const whyChoose = sections.find(s => s.sectionKey === 'why_choose') || null;
    const howItWorks = sections.find(s => s.sectionKey === 'how_it_works') || null;

    // Formatting homeContent based on what catalogController did
    const formattedContent = homeContentRes ? {
      isBannersVisible: homeContentRes.isBannersVisible ?? true,
      isOfferBannersVisible: homeContentRes.isOfferBannersVisible ?? true,
      isPromosVisible: homeContentRes.isPromosVisible ?? true,
      isCuratedVisible: homeContentRes.isCuratedVisible ?? true,
      isNoteworthyVisible: homeContentRes.isNoteworthyVisible ?? true,
      isBookedVisible: homeContentRes.isBookedVisible ?? true,
      isCategorySectionsVisible: homeContentRes.isCategorySectionsVisible ?? true,
      isCategoriesVisible: homeContentRes.isCategoriesVisible ?? true,
      isHowItWorksVisible: homeContentRes.isHowItWorksVisible ?? true
    } : {};

    const categories = categoriesRes.map(cat => ({
      id: cat._id.toString(),
      title: cat.name,
      slug: cat.slug,
      icon: cat.icon || '',
      hasSaleBadge: !!cat.saleBadgeText,
      badge: cat.saleBadgeText || null
    }));

    // If homeContentRes is a Mongoose document (from getHomeContent), convert it
    let homeContentObj = homeContentRes;
    if (homeContentRes && typeof homeContentRes.toObject === 'function') {
      homeContentObj = homeContentRes.toObject();
    }

    if (homeContentObj) {
      formattedContent.banners = (homeContentObj.banners || []).map(item => ({
        imageUrl: item.imageUrl,
        targetCategoryId: item.targetCategoryId?.toString() || null,
        slug: item.slug,
        order: item.order
      }));
      formattedContent.offerBanners = (homeContentObj.offerBanners || []).map(item => ({
        imageUrl: item.imageUrl,
        targetCategoryId: item.targetCategoryId?.toString() || null,
        slug: item.slug,
        order: item.order
      }));
      formattedContent.promos = (homeContentObj.promos || []).map(item => ({
        title: item.title,
        subtitle: item.subtitle,
        imageUrl: item.imageUrl,
        targetCategoryId: item.targetCategoryId?.toString() || null,
        order: item.order
      }));
      formattedContent.booked = (homeContentObj.booked || []).map(item => ({
        id: item._id ? item._id.toString() : item.id,
        title: item.title,
        rating: item.rating,
        price: item.price,
        imageUrl: item.imageUrl,
        targetCategoryId: item.targetCategoryId?.toString() || null,
        order: item.order
      }));
    }

    console.log('[USER_HOME_BANNERS_COUNT] Banners count: ' + banners.length);
    console.log('[USER_HOME_SERVICES_COUNT] Services count: ' + quickServices.length);
    console.log('[USER_HOME_RESPONSE_SOURCE_DB] User Home response fetched successfully from MongoDB database');
    
    // Log dynamic icon URLs
    quickServices.forEach(qs => {
      console.log('[USER_HOME_ICON_FROM_DB] Service Name: ' + qs.name + ', Icon/Image: ' + (qs.image || 'None'));
    });

    res.status(200).json({
      success: true,
      categories,
      homeContent: formattedContent,
      quickServices,
      banners,
      offers,
      promos,
      mostBookedServices,
      popularBrands,
      unreadNotifications,
      cartCount: 0, // Replace with actual Cart DB logic if needed
      carePlan,
      whyChoose,
      howItWorks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error fetching home data',
      error: error.message
    });
  }
};

// @desc    Get all categories and services for Our Services section
// @route   GET /api/user/home/services
// @access  Public
const getHomeServices = async (req, res) => {
  try {
    // Fetch all active categories to show on app
    const categories = await ServiceCategory.find({ isActive: true, showOnApp: true })
      .select('_id name slug icon')
      .sort({ displayOrder: 1 })
      .lean();

    // We will inject a static "One Time Services" category if it exists.
    // Fetch One Time Services
    const oneTimeServices = await OneTimeService.find({ isActive: true })
      .select('_id name slug image rating totalReviews startingPrice')
      .sort({ sortOrder: 1 })
      .lean();

    // Fetch Sub Services
    const subServices = await SubService.find({ isActive: true })
      .select('_id name slug image categoryId rating reviewCount startingPrice')
      .sort({ displayOrder: 1 })
      .lean();

    const formattedCategories = [];
    const groupedServices = {};

    // 1. One Time Services Tab
    if (oneTimeServices.length > 0) {
      formattedCategories.push({
        id: 'one_time',
        name: 'One Time Services',
        slug: 'one-time-services',
        icon: 'FiTool'
      });
      groupedServices['one_time'] = oneTimeServices.map(s => ({
        serviceId: s._id,
        name: s.name,
        slug: s.slug,
        iconUrl: s.image,
        imageUrl: s.image,
        categoryId: 'one_time',
        rating: s.rating,
        reviewCount: s.totalReviews,
        startingPrice: s.startingPrice,
        isActive: true,
        type: 'one_time'
      }));
    }

    // 2. Dynamic Categories from DB
    categories.forEach(cat => {
      const catIdStr = cat._id.toString();
      const servicesForCat = subServices.filter(s => s.categoryId && s.categoryId.toString() === catIdStr);
      
      if (servicesForCat.length > 0) {
        formattedCategories.push({
          id: catIdStr,
          name: cat.name,
          slug: cat.slug,
          icon: cat.icon
        });
        
        groupedServices[catIdStr] = servicesForCat.map(s => ({
          serviceId: s._id,
          name: s.name,
          slug: s.slug,
          iconUrl: s.image, // Assume subservice image is used as icon/thumbnail
          imageUrl: s.image,
          categoryId: catIdStr,
          rating: s.rating,
          reviewCount: s.reviewCount,
          startingPrice: s.startingPrice,
          isActive: true,
          type: 'sub_service'
        }));
      }
    });

    res.status(200).json({
      success: true,
      categories: formattedCategories,
      services: groupedServices
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error fetching home services',
      error: error.message
    });
  }
};

module.exports = {
  getHomeData,
  getHomeServices
};
