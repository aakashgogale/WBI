const ServiceCategory = require('../../models/ServiceCategory');
const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

exports.getPublicServiceCategories = catchAsync(async (req, res) => {
  const categories = await ServiceCategory.find({
    isActive: true,
    showOnApp: true
  }).sort({ displayOrder: 1, createdAt: -1 }).lean();

  res.status(200).json({
    success: true,
    count: categories.length,
    categories // Return as categories to easily map in frontend
  });
});

exports.getCategoryBySlug = catchAsync(async (req, res) => {
  const category = await ServiceCategory.findOne({
    slug: req.params.slug,
    isActive: true
  }).lean();

  if (!category) {
    return res.status(404).json({ success: false, message: 'Category not found' });
  }

  res.status(200).json({
    success: true,
    data: category
  });
});

exports.getCategorySubServices = catchAsync(async (req, res) => {
  const category = await ServiceCategory.findOne({ slug: req.params.slug }).lean();
  
  if (!category) {
    return res.status(404).json({ success: false, message: 'Category not found' });
  }

  const SubService = require('../../models/SubService');
  const services = await SubService.find({
    categoryId: category._id,
    isActive: true
  }).sort({ displayOrder: 1 }).lean();

  res.status(200).json({
    success: true,
    count: services.length,
    data: services
  });
});
