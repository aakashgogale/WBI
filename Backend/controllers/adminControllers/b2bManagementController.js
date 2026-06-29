const B2BCompany = require('../../models/B2BCompany');
const B2BDocument = require('../../models/B2BDocument');
const { createNotification } = require('../notificationControllers/notificationController');

/**
 * Get all B2B Companies with filters and pagination
 */
const getAllCompanies = async (req, res) => {
  try {
    const {
      search,
      verificationStatus,
      isActive,
      page = 1,
      limit = 20
    } = req.query;

    const query = {};

    if (verificationStatus) {
      query.verificationStatus = verificationStatus;
    }
    
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    if (search) {
      query.$or = [
        { companyName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { gstNumber: { $regex: search, $options: 'i' } },
        { panNumber: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const companies = await B2BCompany.find(query)
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await B2BCompany.countDocuments(query);

    return res.status(200).json({
      success: true,
      data: companies,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Admin B2B Get All Companies Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve B2B companies list',
      error: error.message
    });
  }
};

/**
 * Approve a B2B Company
 */
const approveCompany = async (req, res) => {
  try {
    const { id } = req.params;

    const company = await B2BCompany.findById(id);
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'B2B Company not found'
      });
    }

    // Update company verification status
    company.verificationStatus = 'approved';
    company.rejectionReason = null;
    
    // Set all documents to verified
    company.documents.forEach(doc => {
      doc.status = 'verified';
      doc.verifiedAt = new Date();
      doc.rejectionReason = null;
    });

    await company.save();

    // Update B2BDocument collection records
    await B2BDocument.updateMany(
      { companyId: company._id },
      { 
        $set: { 
          status: 'verified',
          rejectionReason: null,
          verifiedAt: new Date()
        } 
      }
    );

    // Notify the company authorized person (simulation or log)
    console.log(`[B2B_APPROVAL] B2B Company approved: ${company.companyName} (${company.email})`);

    return res.status(200).json({
      success: true,
      message: 'B2B company approved successfully',
      company: {
        id: company._id,
        companyName: company.companyName,
        verificationStatus: company.verificationStatus
      }
    });
  } catch (error) {
    console.error('Admin Approve B2B Company Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to approve company',
      error: error.message
    });
  }
};

/**
 * Reject a B2B Company
 */
const rejectCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason, rejectedDocuments } = req.body; // rejectedDocuments is array of documentTypes

    if (!rejectionReason) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
    }

    const company = await B2BCompany.findById(id);
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'B2B Company not found'
      });
    }

    company.verificationStatus = 'rejected';
    company.rejectionReason = rejectionReason;

    // Mark documents as rejected
    if (rejectedDocuments && rejectedDocuments.length > 0) {
      company.documents.forEach(doc => {
        if (rejectedDocuments.includes(doc.documentType)) {
          doc.status = 'rejected';
          doc.rejectionReason = rejectionReason;
        } else {
          doc.status = 'verified'; // Assume others are verified
        }
      });
    } else {
      // Reject all documents if none specified
      company.documents.forEach(doc => {
        doc.status = 'rejected';
        doc.rejectionReason = rejectionReason;
      });
    }

    await company.save();

    // Update B2BDocument collection records
    if (rejectedDocuments && rejectedDocuments.length > 0) {
      await B2BDocument.updateMany(
        { companyId: company._id, documentType: { $in: rejectedDocuments } },
        { $set: { status: 'rejected', rejectionReason } }
      );
      await B2BDocument.updateMany(
        { companyId: company._id, documentType: { $nin: rejectedDocuments } },
        { $set: { status: 'verified', rejectionReason: null } }
      );
    } else {
      await B2BDocument.updateMany(
        { companyId: company._id },
        { $set: { status: 'rejected', rejectionReason } }
      );
    }

    console.log(`[B2B_REJECTION] B2B Company rejected: ${company.companyName} (${company.email}). Reason: ${rejectionReason}`);

    return res.status(200).json({
      success: true,
      message: 'B2B company rejected successfully',
      company: {
        id: company._id,
        companyName: company.companyName,
        verificationStatus: company.verificationStatus,
        rejectionReason: company.rejectionReason
      }
    });
  } catch (error) {
    console.error('Admin Reject B2B Company Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to reject company',
      error: error.message
    });
  }
};

module.exports = {
  getAllCompanies,
  approveCompany,
  rejectCompany
};
