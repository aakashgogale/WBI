const WebEnquiry = require('../models/WebEnquiry');

/**
 * @desc    Submit a new web development enquiry
 * @route   POST /api/public/web-enquiries
 * @access  Public
 */
exports.createEnquiry = async (req, res) => {
  try {
    const {
      fullName,
      companyName,
      email,
      phone,
      city,
      websiteType,
      projectTitle,
      description,
      targetAudience,
      pagesNeeded,
      featuresRequired,
      techPreference,
      hasExistingWebsite,
      existingWebsiteUrl,
      hasBrandingReady,
      designStylePreference,
      referenceWebsites,
      deadline,
      budgetRange,
      source,
      attachments
    } = req.body;

    // Validate required fields
    if (!fullName || !email || !phone || !city || !websiteType || !description) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Create the enquiry
    const enquiry = await WebEnquiry.create({
      fullName,
      companyName,
      email,
      phone,
      city,
      websiteType,
      projectTitle,
      description,
      targetAudience,
      pagesNeeded,
      featuresRequired,
      techPreference,
      hasExistingWebsite,
      existingWebsiteUrl,
      hasBrandingReady,
      designStylePreference,
      referenceWebsites,
      deadline: deadline || undefined,
      budgetRange,
      source,
      attachments: attachments || []
    });

    res.status(201).json({
      success: true,
      message: 'Enquiry submitted successfully. Our team will contact you within 24 hours.',
      data: enquiry
    });
  } catch (error) {
    console.error('Error creating web enquiry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit enquiry',
      error: error.message
    });
  }
};

/**
 * @desc    Get all web enquiries (Admin)
 * @route   GET /api/admin/web-enquiries
 * @access  Private/Admin
 */
exports.getAllEnquiries = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;

    // Build query
    const query = {};
    if (req.query.status) {
      query.status = req.query.status;
    }

    const total = await WebEnquiry.countDocuments(query);
    const enquiries = await WebEnquiry.find(query)
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: enquiries.length,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      data: enquiries
    });
  } catch (error) {
    console.error('Error fetching web enquiries:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch enquiries'
    });
  }
};

/**
 * @desc    Update enquiry status/notes (Admin)
 * @route   PUT /api/admin/web-enquiries/:id
 * @access  Private/Admin
 */
exports.updateEnquiryStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    
    let enquiry = await WebEnquiry.findById(req.params.id);
    
    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: 'Enquiry not found'
      });
    }

    if (status) enquiry.status = status;
    if (notes !== undefined) enquiry.notes = notes; // allow clearing notes

    await enquiry.save();

    res.status(200).json({
      success: true,
      message: 'Enquiry updated successfully',
      data: enquiry
    });
  } catch (error) {
    console.error('Error updating web enquiry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update enquiry'
    });
  }
};

/**
 * @desc    Delete an enquiry (Admin)
 * @route   DELETE /api/admin/web-enquiries/:id
 * @access  Private/Admin
 */
exports.deleteEnquiry = async (req, res) => {
  try {
    const enquiry = await WebEnquiry.findByIdAndDelete(req.params.id);
    
    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: 'Enquiry not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Enquiry deleted successfully',
      data: {}
    });
  } catch (error) {
    console.error('Error deleting web enquiry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete enquiry'
    });
  }
};
