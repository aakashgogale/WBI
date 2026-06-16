const ServiceCategory = require('../../models/ServiceCategory');
const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

exports.getAllServiceCategories = catchAsync(async (req, res) => {
  const categories = await ServiceCategory.find().sort({ displayOrder: 1, createdAt: -1 });
  res.status(200).json({
    success: true,
    count: categories.length,
    data: categories
  });
});

exports.createServiceCategory = catchAsync(async (req, res) => {
  const { name, description, shortDescription, icon, image, bannerImage, trustPoints, displayOrder, isActive, showOnApp, roles } = req.body;
  
  const category = await ServiceCategory.create({
    name,
    description,
    shortDescription,
    icon,
    image,
    bannerImage,
    trustPoints: trustPoints || [],
    displayOrder: displayOrder || 0,
    isActive: isActive !== undefined ? isActive : true,
    showOnApp: showOnApp !== undefined ? showOnApp : true,
    roles: roles && roles.length > 0 ? roles : ['worker']
  });

  res.status(201).json({
    success: true,
    data: category
  });
});

exports.updateServiceCategory = catchAsync(async (req, res, next) => {
  const category = await ServiceCategory.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!category) {
    return next(new AppError('Service Category not found', 404));
  }

  res.status(200).json({
    success: true,
    data: category
  });
});

exports.deleteServiceCategory = catchAsync(async (req, res, next) => {
  const category = await ServiceCategory.findByIdAndDelete(req.params.id);

  if (!category) {
    return next(new AppError('Service Category not found', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Service Category deleted successfully'
  });
});

exports.toggleServiceCategoryStatus = catchAsync(async (req, res, next) => {
  const { isActive, showOnApp } = req.body;
  const updateData = {};
  
  if (isActive !== undefined) updateData.isActive = isActive;
  if (showOnApp !== undefined) updateData.showOnApp = showOnApp;

  const category = await ServiceCategory.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true }
  );

  if (!category) {
    return next(new AppError('Service Category not found', 404));
  }

  res.status(200).json({
    success: true,
    data: category
  });
});
