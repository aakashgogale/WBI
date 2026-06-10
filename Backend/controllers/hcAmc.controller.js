const HcAmc = require('../models/HcAmc');

// @desc    Create a new HC AMC enquiry (Public)
// @route   POST /api/public/hcamc-enquiries
// @access  Public
exports.createEnquiry = async (req, res) => {
  try {
    const newEnquiry = new HcAmc({
      ...req.body,
      userId: req.user ? req.user._id : null
    });
    const savedEnquiry = await newEnquiry.save();
    res.status(201).json({ success: true, data: savedEnquiry });
  } catch (error) {
    console.error('Error creating HC AMC enquiry:', error);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// @desc    Get all HC AMC enquiries (Admin)
// @route   GET /api/admin/hcamc-enquiries
// @access  Private/Admin
exports.getAllEnquiries = async (req, res) => {
  try {
    const enquiries = await HcAmc.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: enquiries });
  } catch (error) {
    console.error('Error fetching HC AMC enquiries:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get a single HC AMC enquiry by ID (Admin)
// @route   GET /api/admin/hcamc-enquiries/:id
// @access  Private/Admin
exports.getEnquiryById = async (req, res) => {
  try {
    const enquiry = await HcAmc.findById(req.params.id);
    if (!enquiry) {
      return res.status(404).json({ success: false, message: 'Enquiry not found' });
    }
    res.status(200).json({ success: true, data: enquiry });
  } catch (error) {
    console.error('Error fetching HC AMC enquiry:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Update HC AMC enquiry status (Admin)
// @route   PUT /api/admin/hcamc-enquiries/:id/status
// @access  Private/Admin
exports.updateEnquiryStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const enquiry = await HcAmc.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    if (!enquiry) {
      return res.status(404).json({ success: false, message: 'Enquiry not found' });
    }
    res.status(200).json({ success: true, data: enquiry });
  } catch (error) {
    console.error('Error updating HC AMC enquiry status:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Delete a HC AMC enquiry (Admin)
// @route   DELETE /api/admin/hcamc-enquiries/:id
// @access  Private/Admin
exports.deleteEnquiry = async (req, res) => {
  try {
    const enquiry = await HcAmc.findByIdAndDelete(req.params.id);
    if (!enquiry) {
      return res.status(404).json({ success: false, message: 'Enquiry not found' });
    }
    res.status(200).json({ success: true, message: 'Enquiry deleted successfully' });
  } catch (error) {
    console.error('Error deleting HC AMC enquiry:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
