const OneTimeService = require('../../models/OneTimeService');
const ServiceBrand = require('../../models/ServiceBrand');
const ServiceIssue = require('../../models/ServiceIssue');
const ServicePackage = require('../../models/ServicePackage');
const ServicePricingRule = require('../../models/ServicePricingRule');
const { delCache } = require('../../services/redisService');

// ==========================================
// OneTimeService APIs
// ==========================================

exports.createService = async (req, res) => {
  try {
    const service = await OneTimeService.create(req.body);
    
    console.log('[ADMIN_SERVICE_ICON_UPDATED] Service: ' + service.name + ', Icon/Image: ' + service.image);

    // Invalidate Redis cache
    await delCache('home_data:*');

    // Create a default pricing rule for the service
    await ServicePricingRule.create({
      serviceId: service._id,
      platformFee: 49,
      gstPercent: 18,
      discount: 0
    });

    res.status(201).json({ success: true, data: service });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.getServices = async (req, res) => {
  try {
    const services = await OneTimeService.find().sort({ sortOrder: 1, createdAt: -1 });
    res.status(200).json({ success: true, count: services.length, data: services });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.updateService = async (req, res) => {
  try {
    const service = await OneTimeService.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!service) return res.status(404).json({ success: false, error: 'Service not found' });
    
    console.log('[ADMIN_SERVICE_ICON_UPDATED] Service: ' + service.name + ', Icon/Image: ' + service.image);

    // Invalidate Redis cache
    await delCache('home_data:*');

    res.status(200).json({ success: true, data: service });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.deleteService = async (req, res) => {
  try {
    const service = await OneTimeService.findByIdAndDelete(req.params.id);
    if (!service) return res.status(404).json({ success: false, error: 'Service not found' });
    
    // Invalidate Redis cache
    await delCache('home_data:*');

    // Cleanup related data
    await ServiceBrand.deleteMany({ serviceId: req.params.id });
    await ServiceIssue.deleteMany({ serviceId: req.params.id });
    await ServicePackage.deleteMany({ serviceId: req.params.id });
    await ServicePricingRule.deleteMany({ serviceId: req.params.id });

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// ==========================================
// ServiceBrand APIs
// ==========================================

exports.createBrand = async (req, res) => {
  try {
    const brand = await ServiceBrand.create(req.body);
    res.status(201).json({ success: true, data: brand });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.getBrandsByService = async (req, res) => {
  try {
    const brands = await ServiceBrand.find({ serviceId: req.params.serviceId }).sort({ sortOrder: 1, brandName: 1 });
    res.status(200).json({ success: true, count: brands.length, data: brands });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.updateBrand = async (req, res) => {
  try {
    const brand = await ServiceBrand.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!brand) return res.status(404).json({ success: false, error: 'Brand not found' });
    res.status(200).json({ success: true, data: brand });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.deleteBrand = async (req, res) => {
  try {
    const brand = await ServiceBrand.findByIdAndDelete(req.params.id);
    if (!brand) return res.status(404).json({ success: false, error: 'Brand not found' });
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// ==========================================
// ServiceIssue APIs
// ==========================================

exports.createIssue = async (req, res) => {
  try {
    const issue = await ServiceIssue.create(req.body);
    res.status(201).json({ success: true, data: issue });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.getIssuesByService = async (req, res) => {
  try {
    const issues = await ServiceIssue.find({ serviceId: req.params.serviceId }).populate('brandIds', 'brandName').sort({ sortOrder: 1, title: 1 });
    res.status(200).json({ success: true, count: issues.length, data: issues });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.updateIssue = async (req, res) => {
  try {
    const issue = await ServiceIssue.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!issue) return res.status(404).json({ success: false, error: 'Issue not found' });
    res.status(200).json({ success: true, data: issue });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.deleteIssue = async (req, res) => {
  try {
    const issue = await ServiceIssue.findByIdAndDelete(req.params.id);
    if (!issue) return res.status(404).json({ success: false, error: 'Issue not found' });
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// ==========================================
// ServicePackage APIs
// ==========================================

exports.createPackage = async (req, res) => {
  try {
    const pkg = await ServicePackage.create(req.body);
    res.status(201).json({ success: true, data: pkg });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.getPackagesByService = async (req, res) => {
  try {
    const packages = await ServicePackage.find({ serviceId: req.params.serviceId }).populate('issueIds brandIds').sort({ sortOrder: 1, name: 1 });
    res.status(200).json({ success: true, count: packages.length, data: packages });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.updatePackage = async (req, res) => {
  try {
    const pkg = await ServicePackage.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!pkg) return res.status(404).json({ success: false, error: 'Package not found' });
    res.status(200).json({ success: true, data: pkg });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.deletePackage = async (req, res) => {
  try {
    const pkg = await ServicePackage.findByIdAndDelete(req.params.id);
    if (!pkg) return res.status(404).json({ success: false, error: 'Package not found' });
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// ==========================================
// ServicePricingRule APIs
// ==========================================

exports.getPricingRule = async (req, res) => {
  try {
    const rule = await ServicePricingRule.findOne({ serviceId: req.params.serviceId });
    if (!rule) return res.status(404).json({ success: false, error: 'Pricing rule not found' });
    res.status(200).json({ success: true, data: rule });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.updatePricingRule = async (req, res) => {
  try {
    let rule = await ServicePricingRule.findOne({ serviceId: req.params.serviceId });
    if (!rule) {
      rule = await ServicePricingRule.create({ serviceId: req.params.serviceId, ...req.body });
    } else {
      rule = await ServicePricingRule.findOneAndUpdate({ serviceId: req.params.serviceId }, req.body, { new: true, runValidators: true });
    }
    res.status(200).json({ success: true, data: rule });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
