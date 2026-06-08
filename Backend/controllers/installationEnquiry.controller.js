const InstallationEnquiry = require('../models/InstallationEnquiry');

// Submit new enquiry (Public)
exports.submitEnquiry = async (req, res) => {
  try {
    const newEnquiry = new InstallationEnquiry(req.body);
    await newEnquiry.save();

    if (global.io) {
      global.io.emit('new_enquiry', {
        type: 'Installation',
        message: `New Security Installation Enquiry from ${newEnquiry.fullName}`,
        data: newEnquiry
      });
    }

    res.status(201).json({
      success: true,
      message: 'Installation Enquiry submitted successfully',
      data: newEnquiry
    });
  } catch (error) {
    console.error('Error submitting Installation enquiry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit enquiry',
      error: error.message
    });
  }
};

// Get all enquiries (Admin)
exports.getAllEnquiries = async (req, res) => {
  try {
    const enquiries = await InstallationEnquiry.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: enquiries
    });
  } catch (error) {
    console.error('Error fetching Installation enquiries:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch enquiries'
    });
  }
};

// Get enquiry by ID (Admin)
exports.getEnquiryById = async (req, res) => {
  try {
    const enquiry = await InstallationEnquiry.findById(req.params.id);
    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: 'Enquiry not found'
      });
    }
    res.status(200).json({
      success: true,
      data: enquiry
    });
  } catch (error) {
    console.error('Error fetching Installation enquiry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch enquiry'
    });
  }
};

// Update status (Admin)
exports.updateEnquiryStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const enquiry = await InstallationEnquiry.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    
    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: 'Enquiry not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Status updated successfully',
      data: enquiry
    });
  } catch (error) {
    console.error('Error updating Installation enquiry status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update status'
    });
  }
};

// Delete enquiry (Admin)
exports.deleteEnquiry = async (req, res) => {
  try {
    const enquiry = await InstallationEnquiry.findByIdAndDelete(req.params.id);
    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: 'Enquiry not found'
      });
    }
    res.status(200).json({
      success: true,
      message: 'Enquiry deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting Installation enquiry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete enquiry'
    });
  }
};
