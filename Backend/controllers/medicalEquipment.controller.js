const MedicalEquipmentService = require('../models/MedicalEquipmentService');

// @desc    Create a new Medical Equipment Service enquiry (Public)
// @route   POST /api/public/medical-equipment-enquiries
// @access  Public
exports.createEnquiry = async (req, res) => {
  try {
    const newEnquiry = new MedicalEquipmentService({
      ...req.body,
      userId: req.user ? req.user._id : null
    });
    const savedEnquiry = await newEnquiry.save();
    res.status(201).json({ success: true, data: savedEnquiry });
  } catch (error) {
    console.error('Error creating Medical Equipment Service enquiry:', error);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// @desc    Get all Medical Equipment Service enquiries (Admin)
// @route   GET /api/admin/medical-equipment-enquiries
// @access  Private/Admin
exports.getAllEnquiries = async (req, res) => {
  try {
    const enquiries = await MedicalEquipmentService.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: enquiries });
  } catch (error) {
    console.error('Error fetching Medical Equipment Service enquiries:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get a single Medical Equipment Service enquiry by ID (Admin)
// @route   GET /api/admin/medical-equipment-enquiries/:id
// @access  Private/Admin
exports.getEnquiryById = async (req, res) => {
  try {
    const enquiry = await MedicalEquipmentService.findById(req.params.id);
    if (!enquiry) {
      return res.status(404).json({ success: false, message: 'Enquiry not found' });
    }
    res.status(200).json({ success: true, data: enquiry });
  } catch (error) {
    console.error('Error fetching Medical Equipment Service enquiry:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Update Medical Equipment Service enquiry status (Admin)
// @route   PUT /api/admin/medical-equipment-enquiries/:id/status
// @access  Private/Admin
exports.updateEnquiryStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const enquiry = await MedicalEquipmentService.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    if (!enquiry) {
      return res.status(404).json({ success: false, message: 'Enquiry not found' });
    }
    res.status(200).json({ success: true, data: enquiry });
  } catch (error) {
    console.error('Error updating Medical Equipment Service enquiry status:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Delete a Medical Equipment Service enquiry (Admin)
// @route   DELETE /api/admin/medical-equipment-enquiries/:id
// @access  Private/Admin
exports.deleteEnquiry = async (req, res) => {
  try {
    const enquiry = await MedicalEquipmentService.findByIdAndDelete(req.params.id);
    if (!enquiry) {
      return res.status(404).json({ success: false, message: 'Enquiry not found' });
    }
    res.status(200).json({ success: true, message: 'Enquiry deleted successfully' });
  } catch (error) {
    console.error('Error deleting Medical Equipment Service enquiry:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
