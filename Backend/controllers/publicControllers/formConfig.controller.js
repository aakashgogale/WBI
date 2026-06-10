const FormConfig = require('../../models/FormConfig');

// @desc    Get form config by role and formType
// @route   GET /api/public/form-configs?role=worker&formType=registration
// @access  Public
exports.getPublicFormConfig = async (req, res) => {
  try {
    const { role, formType } = req.query;
    
    if (!role || !formType) {
      return res.status(400).json({ success: false, message: 'Role and formType are required' });
    }

    const configs = await FormConfig.find({ role, formType, isActive: true })
      .populate('fields')
      .sort({ displayOrder: 1 })
      .lean();
      
    res.json({ success: true, data: configs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};
