const AppEnquiry = require('../models/AppEnquiry');

// --- Public Endpoints ---

// @desc    Submit a new app development enquiry
// @route   POST /api/public/app-enquiries
// @access  Public
exports.submitEnquiry = async (req, res) => {
  try {
    const enquiry = await AppEnquiry.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Enquiry submitted successfully! Our team will contact you within 24 hours.',
      data: enquiry
    });
  } catch (error) {
    console.error('Error submitting app enquiry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit enquiry',
      error: error.message
    });
  }
};

// --- Admin Endpoints ---

// @desc    Get all app enquiries
// @route   GET /api/admin/app-enquiries
// @access  Private/Admin
exports.getEnquiries = async (req, res) => {
  try {
    const { status, limit = 50, page = 1 } = req.query;
    const query = {};
    
    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const enquiries = await AppEnquiry.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await AppEnquiry.countDocuments(query);

    res.status(200).json({
      success: true,
      count: enquiries.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      data: enquiries
    });
  } catch (error) {
    console.error('Error fetching app enquiries:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch enquiries'
    });
  }
};

// @desc    Get single app enquiry
// @route   GET /api/admin/app-enquiries/:id
// @access  Private/Admin
exports.getEnquiry = async (req, res) => {
  try {
    const enquiry = await AppEnquiry.findById(req.params.id);

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
    console.error('Error fetching app enquiry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch enquiry'
    });
  }
};

// @desc    Update enquiry status/notes
// @route   PUT /api/admin/app-enquiries/:id
// @access  Private/Admin
exports.updateEnquiryStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    
    const enquiry = await AppEnquiry.findByIdAndUpdate(
      req.params.id,
      { status, notes },
      { new: true, runValidators: true }
    );

    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: 'Enquiry not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Enquiry updated successfully',
      data: enquiry
    });
  } catch (error) {
    console.error('Error updating app enquiry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update enquiry'
    });
  }
};

// @desc    Delete enquiry
// @route   DELETE /api/admin/app-enquiries/:id
// @access  Private/Admin
exports.deleteEnquiry = async (req, res) => {
  try {
    const enquiry = await AppEnquiry.findByIdAndDelete(req.params.id);

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
    console.error('Error deleting app enquiry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete enquiry'
    });
  }
};
