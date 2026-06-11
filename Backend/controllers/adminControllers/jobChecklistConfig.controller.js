const JobChecklistConfig = require('../../models/JobChecklistConfig');

exports.createConfig = async (req, res) => {
  try {
    const { subServiceId, items, isActive } = req.body;
    
    let config = await JobChecklistConfig.findOne({ subServiceId });
    if (config) {
      return res.status(400).json({ success: false, message: 'Config already exists for this sub-service. Use update instead.' });
    }

    config = new JobChecklistConfig({ subServiceId, items, isActive });
    await config.save();
    
    res.status(201).json({ success: true, data: config });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getConfigBySubService = async (req, res) => {
  try {
    const config = await JobChecklistConfig.findOne({ subServiceId: req.params.subServiceId });
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
    const { items, isActive } = req.body;
    const config = await JobChecklistConfig.findOneAndUpdate(
      { subServiceId: req.params.subServiceId },
      { items, isActive },
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
