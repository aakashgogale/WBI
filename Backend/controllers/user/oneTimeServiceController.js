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
    
    let startingPrice = 299; // Default fallback
    let estimatedTime = '45 - 60 mins';

    if (packages.length > 0) {
      // Find lowest price
      startingPrice = Math.min(...packages.map(p => p.price));
      
      // Get the duration of the most common package or required package
      const requiredPkg = packages.find(p => p.isRequired);
      if (requiredPkg && requiredPkg.estimatedDuration) {
        estimatedTime = requiredPkg.estimatedDuration;
      } else if (packages[0].estimatedDuration) {
        estimatedTime = packages[0].estimatedDuration;
      }
    }

    res.status(200).json({ 
      success: true, 
      data: {
        startingPrice,
        estimatedTime
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Calculate Price Preview for selected packages
exports.getPricePreview = async (req, res) => {
  try {
    const { packageIds, quantities } = req.body;
    
    if (!packageIds || packageIds.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          subtotal: 0,
          platformFee: 0,
          gst: 0,
          totalAmount: 0,
          itemCount: 0
        }
      });
    }

    // Fetch the packages from DB to prevent client-side price manipulation
    const packages = await ServicePackage.find({ _id: { $in: packageIds } });
    
    let subtotal = 0;
    let itemCount = 0;

    // Support both array of package IDs and map of quantities { packageId: qty }
    const qtyMap = quantities || {};

    packages.forEach(pkg => {
      const qty = qtyMap[pkg._id] || 1; // Default to 1 if no quantity provided
      subtotal += pkg.price * qty;
      itemCount += qty;
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
