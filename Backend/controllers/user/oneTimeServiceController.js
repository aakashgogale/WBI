const OneTimeService = require('../../models/OneTimeService');
const ServiceBrand = require('../../models/ServiceBrand');
const ServiceIssue = require('../../models/ServiceIssue');
const ServicePackage = require('../../models/ServicePackage');
const ServicePricingRule = require('../../models/ServicePricingRule');

// Get Service Details by Slug
exports.getServiceDetails = async (req, res) => {
  try {
    const service = await OneTimeService.findOne({ slug: req.params.slug, isActive: true });
    if (!service) return res.status(404).json({ success: false, error: 'Service not found' });
    
    res.status(200).json({ success: true, data: service });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Get Brands for a Service
exports.getServiceBrands = async (req, res) => {
  try {
    const brands = await ServiceBrand.find({ serviceId: req.params.serviceId, isActive: true }).sort({ sortOrder: 1, brandName: 1 });
    res.status(200).json({ success: true, data: brands });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Get Issues for a Service (optionally filtered by brandId)
exports.getServiceIssues = async (req, res) => {
  try {
    const { brandId } = req.query;
    let query = { serviceId: req.params.serviceId, isActive: true };
    
    if (brandId) {
      // Find issues that either have this brandId or have empty brandIds (meaning it applies to all brands)
      query.$or = [
        { brandIds: brandId },
        { brandIds: { $size: 0 } }
      ];
    }

    const issues = await ServiceIssue.find(query).sort({ sortOrder: 1, title: 1 });
    res.status(200).json({ success: true, data: issues });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Get Packages based on Service, Brand, and Issues
exports.getServicePackages = async (req, res) => {
  try {
    const { brandId, issueIds } = req.query;
    let query = { serviceId: req.params.serviceId, isActive: true };
    
    // Parse issueIds if provided as comma-separated
    let issuesArray = [];
    if (issueIds) {
      issuesArray = issueIds.split(',');
    }

    // Logic to filter packages:
    // We want packages that are generic (no brand/issue restriction)
    // OR packages that match the specific brand
    // OR packages that match the specific issues selected
    let orConditions = [
      { brandIds: { $size: 0 }, issueIds: { $size: 0 } } // Generic packages for this service
    ];

    if (brandId) {
      orConditions.push({ brandIds: brandId });
    }

    if (issuesArray.length > 0) {
      orConditions.push({ issueIds: { $in: issuesArray } });
    }

    query.$or = orConditions;

    const packages = await ServicePackage.find(query).sort({ isRequired: -1, sortOrder: 1, price: 1 });
    res.status(200).json({ success: true, data: packages });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Get Service Estimate (Starting Price and Estimated Time)
exports.getServiceEstimate = async (req, res) => {
  try {
    const { brandId, issueIds } = req.query;
    // We fetch the packages based on the selections to determine the lowest starting price and average time
    req.params.serviceId = req.params.serviceId;
    
    // Use the same logic as getServicePackages but just to aggregate
    let query = { serviceId: req.params.serviceId, isActive: true };
    let issuesArray = issueIds ? issueIds.split(',') : [];
    
    let orConditions = [{ brandIds: { $size: 0 }, issueIds: { $size: 0 } }];
    if (brandId) orConditions.push({ brandIds: brandId });
    if (issuesArray.length > 0) orConditions.push({ issueIds: { $in: issuesArray } });
    
    query.$or = orConditions;

    const packages = await ServicePackage.find(query);
    
    let startingPrice = 0;
    let totalDuration = 0;
    let durationCount = 0;

    packages.forEach(pkg => {
      if (startingPrice === 0 || pkg.price < startingPrice) startingPrice = pkg.price;
      if (pkg.estimatedDurationMins) {
        totalDuration += pkg.estimatedDurationMins;
        durationCount++;
      }
    });

    const avgDuration = durationCount > 0 ? Math.round(totalDuration / durationCount) : 60;

    res.status(200).json({ 
      success: true, 
      data: { 
        startingPrice, 
        estimatedDurationMins: avgDuration 
      } 
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Calculate Price Preview based on selections
exports.getPricePreview = async (req, res) => {
  try {
    const { serviceId, packageIds } = req.body;
    
    if (!packageIds || packageIds.length === 0) {
       return res.status(200).json({ success: true, data: { itemTotal: 0, finalTotal: 0, items: [] }});
    }

    const packages = await ServicePackage.find({ _id: { $in: packageIds }, isActive: true });
    
    let itemTotal = 0;
    let items = [];

    packages.forEach(pkg => {
      itemTotal += pkg.price;
      items.push({
        id: pkg._id,
        title: pkg.title,
        price: pkg.price
      });
    });

    // Configurable fees (could be moved to a settings collection later)
    const platformFee = 49;
    const gstPercent = 18;
    
    const gst = Math.round((subtotal + platformFee) * (gstPercent / 100));
    const totalAmount = subtotal + platformFee + gst;

    res.status(200).json({
      success: true,
      data: {
        subtotal,
        platformFee,
        gst,
        totalAmount,
        itemCount
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Search Services
exports.searchServices = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(200).json({ success: true, data: [] });
    }

    const escapedQuery = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const searchRegex = new RegExp(escapedQuery, 'i');

    const services = await OneTimeService.find({
      isActive: true,
      categoryType: 'one_time',
      $or: [
        { name: searchRegex },
        { subtitle: searchRegex },
        { slug: searchRegex }
      ]
    }).select('name slug image rating totalReviews startingPrice').limit(10).lean();

    res.status(200).json({ success: true, data: services });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get Most Booked Services
exports.getMostBooked = async (req, res) => {
  try {
    const services = await OneTimeService.find({
      isActive: true,
      categoryType: 'one_time'
    })
    .sort({ rating: -1, totalReviews: -1 }) // Proxy for most booked
    .limit(10)
    .select('name slug image rating totalReviews startingPrice')
    .lean();

    res.status(200).json({ success: true, data: services });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
