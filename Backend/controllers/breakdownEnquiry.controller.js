const BreakdownEnquiry = require('../models/BreakdownEnquiry');

// Submit new enquiry (Public)
exports.submitEnquiry = async (req, res) => {
  try {
    const newEnquiry = new BreakdownEnquiry(req.body);
    await newEnquiry.save();

    if (global.io) {
      global.io.emit('new_enquiry', {
        type: 'Emergency Breakdown',
        message: `EMERGENCY: Security Breakdown at ${newEnquiry.siteAddress} (${newEnquiry.urgency})`,
        data: newEnquiry
      });
    }

    res.status(201).json({
      success: true,
      message: 'Breakdown Enquiry submitted successfully',
      data: newEnquiry
    });
  } catch (error) {
    console.error('Error submitting Breakdown enquiry:', error);
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
    const enquiries = await BreakdownEnquiry.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: enquiries
    });
  } catch (error) {
    console.error('Error fetching Breakdown enquiries:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch enquiries'
    });
  }
};

// Get enquiry by ID (Admin)
exports.getEnquiryById = async (req, res) => {
  try {
    const enquiry = await BreakdownEnquiry.findById(req.params.id);
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
    console.error('Error fetching Breakdown enquiry:', error);
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
    const enquiry = await BreakdownEnquiry.findByIdAndUpdate(
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
    console.error('Error updating Breakdown enquiry status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update status'
    });
  }
};

// Delete enquiry (Admin)
exports.deleteEnquiry = async (req, res) => {
  try {
    const enquiry = await BreakdownEnquiry.findByIdAndDelete(req.params.id);
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
    console.error('Error deleting Breakdown enquiry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete enquiry'
    });
  }
};
