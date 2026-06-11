const DynamicFormConfig = require('../../models/DynamicFormConfig');

exports.createConfig = async (req, res) => {
  try {
    const { subServiceId, fields, isActive } = req.body;
    
    // Check if config already exists for this subservice
    let config = await DynamicFormConfig.findOne({ subServiceId });
    if (config) {
      return res.status(400).json({ success: false, message: 'Config already exists for this sub-service. Use update instead.' });
    }

    config = new DynamicFormConfig({ subServiceId, fields, isActive });
    await config.save();
    
    res.status(201).json({ success: true, data: config });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getConfigBySubService = async (req, res) => {
  try {
    const config = await DynamicFormConfig.findOne({ subServiceId: req.params.subServiceId });
    if (!config) {
      return res.status(404).json({ success: false, message: 'Config not found' });
    }
    res.status(200).json({ success: true, data: config });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateConfig = async (req, res) => {
  try {
    const { fields, isActive } = req.body;
    const config = await DynamicFormConfig.findOneAndUpdate(
      { subServiceId: req.params.subServiceId },
      { fields, isActive },
      { new: true, runValidators: true }
    );
    if (!config) {
      return res.status(404).json({ success: false, message: 'Config not found' });
    }
    res.status(200).json({ success: true, data: config });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
