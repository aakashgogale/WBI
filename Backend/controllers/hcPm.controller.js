const HcPreventiveMaintenance = require('../models/HcPreventiveMaintenance');

// @desc    Create a new HC PM enquiry (Public)
// @route   POST /api/public/hcpm-enquiries
// @access  Public
exports.createEnquiry = async (req, res) => {
  try {
    const newEnquiry = new HcPreventiveMaintenance({
      ...req.body,
      userId: req.user ? req.user._id : null
    });
    const savedEnquiry = await newEnquiry.save();
    res.status(201).json({ success: true, data: savedEnquiry });
  } catch (error) {
    console.error('Error creating HC PM enquiry:', error);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// @desc    Get all HC PM enquiries (Admin)
// @route   GET /api/admin/hcpm-enquiries
// @access  Private/Admin
exports.getAllEnquiries = async (req, res) => {
  try {
    const enquiries = await HcPreventiveMaintenance.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: enquiries });
  } catch (error) {
    console.error('Error fetching HC PM enquiries:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get a single HC PM enquiry by ID (Admin)
// @route   GET /api/admin/hcpm-enquiries/:id
// @access  Private/Admin
exports.getEnquiryById = async (req, res) => {
  try {
    const enquiry = await HcPreventiveMaintenance.findById(req.params.id);
    if (!enquiry) {
      return res.status(404).json({ success: false, message: 'Enquiry not found' });
    }
    res.status(200).json({ success: true, data: enquiry });
  } catch (error) {
    console.error('Error fetching HC PM enquiry:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Update HC PM enquiry status (Admin)
// @route   PUT /api/admin/hcpm-enquiries/:id/status
// @access  Private/Admin
exports.updateEnquiryStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const enquiry = await HcPreventiveMaintenance.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    if (!enquiry) {
      return res.status(404).json({ success: false, message: 'Enquiry not found' });
    }
    res.status(200).json({ success: true, data: enquiry });
  } catch (error) {
    console.error('Error updating HC PM enquiry status:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Delete a HC PM enquiry (Admin)
// @route   DELETE /api/admin/hcpm-enquiries/:id
// @access  Private/Admin
exports.deleteEnquiry = async (req, res) => {
  try {
    const enquiry = await HcPreventiveMaintenance.findByIdAndDelete(req.params.id);
    if (!enquiry) {
      return res.status(404).json({ success: false, message: 'Enquiry not found' });
    }
    res.status(200).json({ success: true, message: 'Enquiry deleted successfully' });
  } catch (error) {
    console.error('Error deleting HC PM enquiry:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
