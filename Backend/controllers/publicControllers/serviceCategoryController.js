const ServiceCategory = require('../../models/ServiceCategory');
const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

exports.getPublicServiceCategories = catchAsync(async (req, res) => {
  const categories = await ServiceCategory.find({
    isActive: true,
    showOnApp: true
  }).sort({ displayOrder: 1, createdAt: -1 });

  res.status(200).json({
    success: true,
    count: categories.length,
    categories // Return as categories to easily map in frontend
  });
});
