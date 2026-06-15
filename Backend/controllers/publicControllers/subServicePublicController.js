const SubService = require('../../models/SubService');
const ServiceCategory = require('../../models/ServiceCategory');

/**
 * Get public sub-services with optional categoryId and role filtering
 * GET /api/sub-services?categoryId=&role=
 */
const getPublicSubServices = async (req, res) => {
  try {
    const { categoryId, role } = req.query;
    const filter = { isActive: true };

    if (categoryId) {
      filter.categoryId = categoryId;
    }

    // Fetch subservices
    let subServices = await SubService.find(filter)
      .populate('categoryId', 'name slug roles isActive')
      .sort({ displayOrder: 1, name: 1 })
      .lean();

    // If role filter is provided, filter subservices where category roles include role
    if (role) {
      subServices = subServices.filter(s => 
        s.categoryId && 
        s.categoryId.isActive &&
        Array.isArray(s.categoryId.roles) && 
        s.categoryId.roles.includes(role.toLowerCase())
      );
    }

    res.status(200).json({
      success: true,
      count: subServices.length,
      data: subServices
    });
  } catch (error) {
    console.error('Error fetching public subservices:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sub-services'
    });
  }
};

/**
 * Get skills and suggested tools for a specific sub-service
 * GET /api/skills?subServiceId=
 */
const getPublicSkillsAndTools = async (req, res) => {
  try {
    const { subServiceId } = req.query;

    if (!subServiceId) {
      return res.status(400).json({
        success: false,
        message: 'subServiceId is required'
      });
    }

    const subService = await SubService.findOne({ _id: subServiceId, isActive: true })
      .select('name requiredSkills suggestedTools')
      .lean();

    if (!subService) {
      return res.status(404).json({
        success: false,
        message: 'Sub-service not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        subServiceId: subService._id,
        name: subService.name,
        suggestedSkills: subService.requiredSkills || [],
        suggestedTools: subService.suggestedTools || []
      }
    });
  } catch (error) {
    console.error('Error fetching public skills and tools:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch skills and tools'
    });
  }
};

module.exports = {
  getPublicSubServices,
  getPublicSkillsAndTools
};
