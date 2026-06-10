const QualityControlTest = require('../models/QualityControlTest');

// @desc    Create a new QC Test enquiry (Public)
// @route   POST /api/public/qctest-enquiries
// @access  Public
exports.createEnquiry = async (req, res) => {
  try {
    const newEnquiry = new QualityControlTest({
      ...req.body,
      userId: req.user ? req.user._id : null
    });
    const savedEnquiry = await newEnquiry.save();
    res.status(201).json({ success: true, data: savedEnquiry });
  } catch (error) {
    console.error('Error creating QC Test enquiry:', error);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// @desc    Get all QC Test enquiries (Admin)
// @route   GET /api/admin/qctest-enquiries
// @access  Private/Admin
exports.getAllEnquiries = async (req, res) => {
  try {
    const enquiries = await QualityControlTest.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: enquiries });
  } catch (error) {
    console.error('Error fetching QC Test enquiries:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get a single QC Test enquiry by ID (Admin)
// @route   GET /api/admin/qctest-enquiries/:id
// @access  Private/Admin
exports.getEnquiryById = async (req, res) => {
  try {
    const enquiry = await QualityControlTest.findById(req.params.id);
    if (!enquiry) {
      return res.status(404).json({ success: false, message: 'Enquiry not found' });
    }
    res.status(200).json({ success: true, data: enquiry });
  } catch (error) {
    console.error('Error fetching QC Test enquiry:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Update QC Test enquiry status (Admin)
// @route   PUT /api/admin/qctest-enquiries/:id/status
// @access  Private/Admin
exports.updateEnquiryStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const enquiry = await QualityControlTest.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    if (!enquiry) {
      return res.status(404).json({ success: false, message: 'Enquiry not found' });
    }
    res.status(200).json({ success: true, data: enquiry });
  } catch (error) {
    console.error('Error updating QC Test enquiry status:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Delete a QC Test enquiry (Admin)
// @route   DELETE /api/admin/qctest-enquiries/:id
// @access  Private/Admin
exports.deleteEnquiry = async (req, res) => {
  try {
    const enquiry = await QualityControlTest.findByIdAndDelete(req.params.id);
    if (!enquiry) {
      return res.status(404).json({ success: false, message: 'Enquiry not found' });
    }
    res.status(200).json({ success: true, message: 'Enquiry deleted successfully' });
  } catch (error) {
    console.error('Error deleting QC Test enquiry:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
