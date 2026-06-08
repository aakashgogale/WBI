const SubService = require('../../models/SubService');
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

exports.getAllSubServices = catchAsync(async (req, res) => {
  // Can filter by categoryId if passed in query
  const filter = {};
  if (req.query.categoryId) {
    filter.categoryId = req.query.categoryId;
  }
  
  const services = await SubService.find(filter)
    .populate('categoryId', 'name slug')
    .sort({ categoryId: 1, displayOrder: 1, createdAt: -1 });
    
  res.status(200).json({
    success: true,
    count: services.length,
    data: services
  });
});

exports.createSubService = catchAsync(async (req, res) => {
  const { categoryId, name, description, icon, image, startingPrice, rating, reviewCount, displayOrder, isActive, isFeatured } = req.body;
  
  const subService = await SubService.create({
    categoryId,
    name,
    description,
    icon,
    image,
    startingPrice,
    rating: rating || 4.8,
    reviewCount: reviewCount || 128,
    displayOrder: displayOrder || 0,
    isActive: isActive !== undefined ? isActive : true,
    isFeatured: isFeatured !== undefined ? isFeatured : false
  });

  res.status(201).json({
    success: true,
    data: subService
  });
});

exports.updateSubService = catchAsync(async (req, res, next) => {
  const subService = await SubService.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!subService) {
    return next(new AppError('Sub Service not found', 404));
  }

  res.status(200).json({
    success: true,
    data: subService
  });
});

exports.deleteSubService = catchAsync(async (req, res, next) => {
  const subService = await SubService.findByIdAndDelete(req.params.id);

  if (!subService) {
    return next(new AppError('Sub Service not found', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Sub Service deleted successfully'
  });
});

exports.toggleSubServiceStatus = catchAsync(async (req, res, next) => {
  const { isActive, isFeatured } = req.body;
  const updateData = {};
  
  if (isActive !== undefined) updateData.isActive = isActive;
  if (isFeatured !== undefined) updateData.isFeatured = isFeatured;

  const subService = await SubService.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true }
  );

  if (!subService) {
    return next(new AppError('Sub Service not found', 404));
  }

  res.status(200).json({
    success: true,
    data: subService
  });
});
