const CrmEnquiry = require('../models/CrmEnquiry');

// @desc    Submit a new CRM enquiry
// @route   POST /api/public/crm-enquiries
// @access  Public
exports.submitEnquiry = async (req, res) => {
  try {
    const enquiry = await CrmEnquiry.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Enquiry submitted successfully',
      data: enquiry,
    });
  } catch (error) {
    console.error('Error submitting CRM enquiry:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to submit enquiry',
      error: error.message,
    });
  }
};

// @desc    Get all CRM enquiries (with pagination and filtering)
// @route   GET /api/admin/crm-enquiries
// @access  Private/Admin
exports.getEnquiries = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;

    // Filtering
    const query = {};
    if (req.query.status) {
      query.status = req.query.status;
    }

    const total = await CrmEnquiry.countDocuments(query);
    const enquiries = await CrmEnquiry.find(query)
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: enquiries.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: enquiries,
    });
  } catch (error) {
    console.error('Error fetching CRM enquiries:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
};

// @desc    Get single CRM enquiry
// @route   GET /api/admin/crm-enquiries/:id
// @access  Private/Admin
exports.getEnquiry = async (req, res) => {
  try {
    const enquiry = await CrmEnquiry.findById(req.params.id);

    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: 'Enquiry not found',
      });
    }

    res.status(200).json({
      success: true,
      data: enquiry,
    });
  } catch (error) {
    console.error('Error fetching CRM enquiry:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
};

// @desc    Update CRM enquiry status
// @route   PUT /api/admin/crm-enquiries/:id
// @access  Private/Admin
exports.updateEnquiryStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;

    const enquiry = await CrmEnquiry.findByIdAndUpdate(
      req.params.id,
      { status, notes },
      { new: true, runValidators: true }
    );

    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: 'Enquiry not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Enquiry status updated successfully',
      data: enquiry,
    });
  } catch (error) {
    console.error('Error updating CRM enquiry status:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to update status',
      error: error.message,
    });
  }
};

// @desc    Delete CRM enquiry
// @route   DELETE /api/admin/crm-enquiries/:id
// @access  Private/Admin
exports.deleteEnquiry = async (req, res) => {
  try {
    const enquiry = await CrmEnquiry.findByIdAndDelete(req.params.id);

    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: 'Enquiry not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Enquiry deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting CRM enquiry:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
};
