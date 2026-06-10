const WorkerSkill = require('../../models/WorkerSkill');
const WorkerDocumentConfig = require('../../models/WorkerDocumentConfig');
const WorkerRegistrationConfig = require('../../models/WorkerRegistrationConfig');
const Category = require('../../models/Category');

/**
 * Get unified dynamic configuration payload for Worker Registration flow
 * GET /api/worker/config/registration
 */
const getRegistrationConfig = async (req, res) => {
  try {
    // 1. Fetch Categories (where workers can register)
    const categories = await Category.find({ status: 'active' }).select('title slug homeIconUrl iconUrl').lean();

    // 2. Fetch Skills
    const skills = await WorkerSkill.find({ isActive: true }).select('name categoryId').lean();

    // 3. Fetch Document Requirements
    const documents = await WorkerDocumentConfig.find({ isActive: true }).sort({ order: 1 }).lean();

    // 4. Fetch Registration Steps & General Config
    let registrationConfig = await WorkerRegistrationConfig.findOne().lean();
    
    // Fallback if not initialized
    if (!registrationConfig) {
      registrationConfig = {
        isRegistrationEnabled: true,
        steps: [
          { stepNumber: 1, title: 'Basic Info', isActive: true },
          { stepNumber: 2, title: 'Skills & Work', isActive: true },
          { stepNumber: 3, title: 'Documents', isActive: true },
          { stepNumber: 4, title: 'Location & Availability', isActive: true },
          { stepNumber: 5, title: 'Complete', isActive: true }
        ]
      };
    }

    res.status(200).json({
      success: true,
      config: {
        isRegistrationEnabled: registrationConfig.isRegistrationEnabled,
        steps: registrationConfig.steps.filter(s => s.isActive).sort((a,b) => a.stepNumber - b.stepNumber),
        categories: categories.map(c => ({ id: c._id.toString(), title: c.title, icon: c.homeIconUrl || c.iconUrl })),
        skills: skills.map(s => ({ id: s._id.toString(), name: s.name, categoryId: s.categoryId })),
        documents: documents.map(d => ({
          key: d.key,
          title: d.title,
          description: d.description,
          isRequired: d.isRequired,
          requiresFrontAndBack: d.requiresFrontAndBack,
          acceptedFormats: d.acceptedFormats
        }))
      }
    });
  } catch (error) {
    console.error('Get registration config error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch registration configuration'
    });
  }
};

module.exports = {
  getRegistrationConfig
};
