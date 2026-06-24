const OneTimeService = require('../../models/OneTimeService');
const Banner = require('../../models/Banner');
const Notification = require('../../models/Notification');
// Import Cart logic if it's stored in DB, otherwise cart count might be handled purely frontend or different logic.
// Based on typical implementation, we might not fetch cart from DB if it's local storage, but assuming DB here if auth'd.

// @desc    Get dynamic User Home data
// @route   GET /api/user/home
// @access  Public/Private
const getHomeData = async (req, res) => {
  try {
    const { cityId } = req.query; // If needed for location-based filtering later
    
    // 1. Fetch active Quick Services (One-Time Services)
    const quickServices = await OneTimeService.find({ 
      isActive: true, 
      categoryType: 'one_time' 
    })
    .select('name slug image rating totalReviews startingPrice')
    .sort({ sortOrder: 1, createdAt: -1 })
    .limit(12)
    .lean();

    // 2. Fetch Banners (home_banner)
    const banners = await Banner.find({ 
      isActive: true, 
      bannerType: 'home_banner' 
    })
    .sort({ sortOrder: 1, createdAt: -1 })
    .lean();

    // 3. Fetch Offers (offer_banner)
    const offers = await Banner.find({ 
      isActive: true, 
      bannerType: 'offer_banner' 
    })
    .sort({ sortOrder: 1, createdAt: -1 })
    .lean();

    // 4. Fetch Promos (promo_banner)
    const promos = await Banner.find({ 
      isActive: true, 
      bannerType: 'promo_banner' 
    })
    .sort({ sortOrder: 1, createdAt: -1 })
    .lean();

    // 5. Fetch Most Booked Services (Using OneTimeService ordered by rating/bookings if available)
    const mostBookedServices = await OneTimeService.find({ 
      isActive: true, 
      categoryType: 'one_time' 
    })
    .select('name slug image rating totalReviews startingPrice')
    .sort({ rating: -1, totalReviews: -1 }) // Sort by highest rating/reviews to simulate most booked
    .limit(10)
    .lean();

    // 6. Notifications Count (If user is authenticated)
    let unreadNotifications = 0;
    if (req.user) {
      unreadNotifications = await Notification.countDocuments({ 
        user: req.user._id, 
        isRead: false 
      });
    }

    res.status(200).json({
      success: true,
      quickServices,
      banners,
      offers,
      promos,
      mostBookedServices,
      unreadNotifications,
      cartCount: 0 // Replace with actual Cart DB logic if needed
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error fetching home data',
      error: error.message
    });
  }
};

module.exports = {
  getHomeData
};
