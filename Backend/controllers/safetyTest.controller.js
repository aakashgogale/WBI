const ElectricalSafetyTest = require('../models/ElectricalSafetyTest');

// @desc    Create a new Safety Test enquiry (Public)
// @route   POST /api/public/safetytest-enquiries
// @access  Public
exports.createEnquiry = async (req, res) => {
  try {
    const newEnquiry = new ElectricalSafetyTest({
      ...req.body,
      userId: req.user ? req.user._id : null
    });
    const savedEnquiry = await newEnquiry.save();
    res.status(201).json({ success: true, data: savedEnquiry });
  } catch (error) {
    console.error('Error creating Safety Test enquiry:', error);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// @desc    Get all Safety Test enquiries (Admin)
// @route   GET /api/admin/safetytest-enquiries
// @access  Private/Admin
exports.getAllEnquiries = async (req, res) => {
  try {
    const enquiries = await ElectricalSafetyTest.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: enquiries });
  } catch (error) {
    console.error('Error fetching Safety Test enquiries:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get a single Safety Test enquiry by ID (Admin)
// @route   GET /api/admin/safetytest-enquiries/:id
// @access  Private/Admin
exports.getEnquiryById = async (req, res) => {
  try {
    const enquiry = await ElectricalSafetyTest.findById(req.params.id);
    if (!enquiry) {
      return res.status(404).json({ success: false, message: 'Enquiry not found' });
    }
    res.status(200).json({ success: true, data: enquiry });
  } catch (error) {
    console.error('Error fetching Safety Test enquiry:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Update Safety Test enquiry status (Admin)
// @route   PUT /api/admin/safetytest-enquiries/:id/status
// @access  Private/Admin
exports.updateEnquiryStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const enquiry = await ElectricalSafetyTest.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    if (!enquiry) {
      return res.status(404).json({ success: false, message: 'Enquiry not found' });
    }
    res.status(200).json({ success: true, data: enquiry });
  } catch (error) {
    console.error('Error updating Safety Test enquiry status:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Delete a Safety Test enquiry (Admin)
// @route   DELETE /api/admin/safetytest-enquiries/:id
// @access  Private/Admin
exports.deleteEnquiry = async (req, res) => {
  try {
    const enquiry = await ElectricalSafetyTest.findByIdAndDelete(req.params.id);
    if (!enquiry) {
      return res.status(404).json({ success: false, message: 'Enquiry not found' });
    }
    res.status(200).json({ success: true, message: 'Enquiry deleted successfully' });
  } catch (error) {
    console.error('Error deleting Safety Test enquiry:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
