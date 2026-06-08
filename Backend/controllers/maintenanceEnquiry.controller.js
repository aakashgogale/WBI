const MaintenanceEnquiry = require('../models/MaintenanceEnquiry');

// Submit new enquiry (Public)
exports.submitEnquiry = async (req, res) => {
  try {
    const newEnquiry = new MaintenanceEnquiry(req.body);
    await newEnquiry.save();

    if (global.io) {
      global.io.emit('new_enquiry', {
        type: 'Maintenance',
        message: `New Preventive Maintenance Enquiry from ${newEnquiry.fullName}`,
        data: newEnquiry
      });
    }

    res.status(201).json({
      success: true,
      message: 'Maintenance Enquiry submitted successfully',
      data: newEnquiry
    });
  } catch (error) {
    console.error('Error submitting Maintenance enquiry:', error);
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
    const enquiries = await MaintenanceEnquiry.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: enquiries
    });
  } catch (error) {
    console.error('Error fetching Maintenance enquiries:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch enquiries'
    });
  }
};

// Get enquiry by ID (Admin)
exports.getEnquiryById = async (req, res) => {
  try {
    const enquiry = await MaintenanceEnquiry.findById(req.params.id);
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
    console.error('Error fetching Maintenance enquiry:', error);
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
    const enquiry = await MaintenanceEnquiry.findByIdAndUpdate(
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
    console.error('Error updating Maintenance enquiry status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update status'
    });
  }
};

// Delete enquiry (Admin)
exports.deleteEnquiry = async (req, res) => {
  try {
    const enquiry = await MaintenanceEnquiry.findByIdAndDelete(req.params.id);
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
    console.error('Error deleting Maintenance enquiry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete enquiry'
    });
  }
};
