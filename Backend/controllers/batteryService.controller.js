const BatteryService = require('../models/BatteryService');

// CREATE an enquiry
exports.createEnquiry = async (req, res) => {
  try {
    const newEnquiry = await BatteryService.create(req.body);
    if (global.io) {
      global.io.emit('newEnquiry', {
        type: 'Battery Service',
        data: newEnquiry
      });
    }
    res.status(201).json({ success: true, data: newEnquiry });
  } catch (error) {
    console.error('Error creating Battery service enquiry:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// GET all enquiries (Admin)
exports.getEnquiries = async (req, res) => {
  try {
    const enquiries = await BatteryService.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: enquiries });
  } catch (error) {
    console.error('Error fetching Battery service enquiries:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// GET single enquiry
exports.getEnquiry = async (req, res) => {
  try {
    const enquiry = await BatteryService.findById(req.params.id);
    if (!enquiry) return res.status(404).json({ success: false, message: 'Enquiry not found' });
    res.status(200).json({ success: true, data: enquiry });
  } catch (error) {
    console.error('Error fetching Battery service enquiry:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// UPDATE status (Admin)
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const enquiry = await BatteryService.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!enquiry) return res.status(404).json({ success: false, message: 'Enquiry not found' });
    res.status(200).json({ success: true, data: enquiry });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// DELETE an enquiry
exports.deleteEnquiry = async (req, res) => {
  try {
    const enquiry = await BatteryService.findByIdAndDelete(req.params.id);
    if (!enquiry) return res.status(404).json({ success: false, message: 'Enquiry not found' });
    res.status(200).json({ success: true, message: 'Enquiry deleted successfully' });
  } catch (error) {
    console.error('Error deleting enquiry:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
