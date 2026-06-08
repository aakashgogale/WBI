const BankingEnquiry = require('../models/BankingEnquiry');

// @desc    Create a new banking enquiry
// @route   POST /api/public/banking-enquiries
// @access  Public
exports.createEnquiry = async (req, res) => {
  try {
    const {
      fullName,
      companyName,
      email,
      phone,
      city,
      branchCode,
      serviceType,
      machineModels,
      numberOfUnits,
      description,
      urgency,
      deadline,
      source,
      attachments
    } = req.body;

    // Validate required fields
    if (!fullName || !email || !phone || !city || !serviceType || !description) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    const enquiry = await BankingEnquiry.create({
      fullName,
      companyName,
      email,
      phone,
      city,
      branchCode,
      serviceType,
      machineModels,
      numberOfUnits,
      description,
      urgency,
      deadline: deadline || undefined,
      source,
      attachments: attachments || []
    });

    res.status(201).json({
      success: true,
      message: 'Banking enquiry submitted successfully',
      data: enquiry
    });
  } catch (error) {
    console.error('Error creating banking enquiry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit enquiry',
      error: error.message
    });
  }
};

// @desc    Get all banking enquiries (Admin)
// @route   GET /api/admin/banking-enquiries
// @access  Private/Admin
exports.getAllEnquiries = async (req, res) => {
  try {
    const { status } = req.query;
    const query = {};
    
    if (status) {
      query.status = status;
    }

    const enquiries = await BankingEnquiry.find(query).sort('-createdAt');

    res.status(200).json({
      success: true,
      count: enquiries.length,
      data: enquiries
    });
  } catch (error) {
    console.error('Error fetching banking enquiries:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch enquiries'
    });
  }
};

// @desc    Update enquiry status (Admin)
// @route   PUT /api/admin/banking-enquiries/:id
// @access  Private/Admin
exports.updateEnquiryStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['Pending', 'Reviewed', 'Contacted', 'Resolved', 'Rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const enquiry = await BankingEnquiry.findByIdAndUpdate(
      req.params.id,
      { status },
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
      message: 'Status updated successfully',
      data: enquiry
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update status'
    });
  }
};

// @desc    Delete an enquiry (Admin)
// @route   DELETE /api/admin/banking-enquiries/:id
// @access  Private/Admin
exports.deleteEnquiry = async (req, res) => {
  try {
    const enquiry = await BankingEnquiry.findByIdAndDelete(req.params.id);

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
    res.status(500).json({
      success: false,
      message: 'Failed to delete enquiry'
    });
  }
};
