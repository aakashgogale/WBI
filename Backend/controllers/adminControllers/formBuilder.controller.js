const FormConfig = require('../../models/FormConfig');
const ProfileField = require('../../models/ProfileField');

// @desc    Get all profile fields
// @route   GET /api/admin/profile-fields
// @access  Private/Admin
exports.getProfileFields = async (req, res) => {
  try {
    const fields = await ProfileField.find().sort({ displayOrder: 1 });
    res.json({ success: true, data: fields });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// @desc    Create a profile field
// @route   POST /api/admin/profile-fields
// @access  Private/Admin
exports.createProfileField = async (req, res) => {
  try {
    const field = await ProfileField.create(req.body);
    res.status(201).json({ success: true, data: field });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Bad Request', error: error.message });
  }
};

// @desc    Update a profile field
// @route   PUT /api/admin/profile-fields/:id
// @access  Private/Admin
exports.updateProfileField = async (req, res) => {
  try {
    const field = await ProfileField.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!field) return res.status(404).json({ success: false, message: 'Field not found' });
    res.json({ success: true, data: field });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Bad Request', error: error.message });
  }
};

// @desc    Delete a profile field
// @route   DELETE /api/admin/profile-fields/:id
// @access  Private/Admin
exports.deleteProfileField = async (req, res) => {
  try {
    const field = await ProfileField.findByIdAndDelete(req.params.id);
    if (!field) return res.status(404).json({ success: false, message: 'Field not found' });
    res.json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// @desc    Get all form configs
// @route   GET /api/admin/form-configs
// @access  Private/Admin
exports.getFormConfigs = async (req, res) => {
  try {
    const { role, formType } = req.query;
    let query = {};
    if (role) query.role = role;
    if (formType) query.formType = formType;
    
    const configs = await FormConfig.find(query).sort({ order: 1 });
    res.json({ success: true, data: configs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// @desc    Create a form config
// @route   POST /api/admin/form-configs
// @access  Private/Admin
exports.createFormConfig = async (req, res) => {
  try {
    const config = await FormConfig.create(req.body);
    res.status(201).json({ success: true, data: config });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Step name for this role and form type already exists' });
    }
    res.status(400).json({ success: false, message: 'Bad Request', error: error.message });
  }
};

// @desc    Update a form config
// @route   PUT /api/admin/form-configs/:id
// @access  Private/Admin
exports.updateFormConfig = async (req, res) => {
  try {
    const config = await FormConfig.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!config) return res.status(404).json({ success: false, message: 'Form config not found' });
    res.json({ success: true, data: config });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Step name for this role and form type already exists' });
    }
    res.status(400).json({ success: false, message: 'Bad Request', error: error.message });
  }
};

// @desc    Delete a form config
// @route   DELETE /api/admin/form-configs/:id
// @access  Private/Admin
exports.deleteFormConfig = async (req, res) => {
  try {
    const config = await FormConfig.findByIdAndDelete(req.params.id);
    if (!config) return res.status(404).json({ success: false, message: 'Form config not found' });
    res.json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};
