const B2BCompany = require('../../models/B2BCompany');
const B2BDocument = require('../../models/B2BDocument');
const { generateTokenPair } = require('../../utils/tokenService');
const bcrypt = require('bcryptjs');

/**
 * Register a new B2B Company
 */
const registerCompany = async (req, res) => {
  try {
    const {
      companyName,
      gstNumber,
      panNumber,
      tanNumber,
      cinNumber,
      logoUrl,
      companyAddress,
      billingAddress,
      branches,
      authorizedPerson,
      email,
      phone,
      password,
      documents
    } = req.body;

    // 1. Check if email or phone is already registered
    const existingCompany = await B2BCompany.findOne({
      $or: [
        { email: email.toLowerCase().trim() },
        { phone: phone.trim() }
      ]
    });

    if (existingCompany) {
      return res.status(400).json({
        success: false,
        message: 'A B2B company is already registered with this email or phone number'
      });
    }

    // 2. Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 3. Prepare documents array for model
    const companyDocs = (documents || []).map(doc => ({
      documentType: doc.documentType,
      fileUrl: doc.fileUrl,
      fileKey: doc.fileKey || null,
      status: 'uploaded',
      uploadedAt: new Date()
    }));

    // 4. Create company record
    const company = await B2BCompany.create({
      companyName,
      gstNumber,
      panNumber,
      tanNumber,
      cinNumber: cinNumber || null,
      logoUrl: logoUrl || null,
      companyAddress,
      billingAddress,
      branches: branches || [],
      authorizedPerson,
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      passwordHash,
      documents: companyDocs,
      verificationStatus: 'pending',
      isActive: true,
      walletBalance: 0
    });

    // 5. Create B2BDocument collection records for granular admin tracking
    if (documents && documents.length > 0) {
      const docRecords = documents.map(doc => ({
        companyId: company._id,
        documentType: doc.documentType,
        fileUrl: doc.fileUrl,
        fileKey: doc.fileKey || null,
        status: 'uploaded',
        uploadedAt: new Date()
      }));
      await B2BDocument.insertMany(docRecords);
    }

    // 6. Notify admins of new registration
    try {
      const Admin = require('../../models/Admin');
      const { createNotification } = require('../notificationControllers/notificationController');
      const admins = await Admin.find({ isActive: true }).select('_id');
      for (const admin of admins) {
        await createNotification({
          adminId: admin._id,
          type: 'b2b_approval_request',
          title: '🏢 New B2B Registration',
          message: `${company.companyName} has requested registration.`,
          relatedId: company._id,
          relatedType: 'b2b_company',
          data: { companyId: company._id, companyName: company.companyName },
          pushData: { type: 'admin_alert', link: '/admin/b2b-companies' }
        });
      }
    } catch (err) {
      console.error('B2B Admin notification error:', err.message);
    }

    return res.status(201).json({
      success: true,
      message: 'Registration submitted successfully. Pending admin approval.',
      companyId: company._id
    });
  } catch (error) {
    console.error('B2B Registration Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to register company. Please try again.',
      error: error.message
    });
  }
};

/**
 * B2B Company Login
 */
const loginCompany = async (req, res) => {
  try {
    const { emailOrMobile, password } = req.body;

    if (!emailOrMobile || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide Email/Mobile and Password'
      });
    }

    const cleanIdentifier = emailOrMobile.trim();

    // 1. Find B2B company by email or phone
    const company = await B2BCompany.findOne({
      $or: [
        { email: cleanIdentifier.toLowerCase() },
        { phone: cleanIdentifier }
      ]
    });

    if (!company) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // 2. Validate password
    const isMatch = await company.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // 3. Check verification status
    if (company.verificationStatus === 'pending') {
      return res.status(403).json({
        success: false,
        verificationStatus: 'pending',
        message: 'Your account is under admin review. Please try again later.'
      });
    }

    if (company.verificationStatus === 'rejected') {
      return res.status(403).json({
        success: false,
        verificationStatus: 'rejected',
        rejectionReason: company.rejectionReason || 'Documents verification failed.',
        message: `Your account registration was rejected. Reason: ${company.rejectionReason || 'Please review your uploaded documents.'}`,
        company: {
          id: company._id,
          companyName: company.companyName,
          email: company.email,
          phone: company.phone,
          documents: company.documents
        }
      });
    }

    // 4. Check active state
    if (!company.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your company account is deactivated. Please contact support.'
      });
    }

    // 5. Generate JWT tokens
    const loginSessionId = Date.now().toString();
    const tokens = generateTokenPair({
      userId: company._id.toString(),
      role: 'B2B',
      profileId: company._id.toString(),
      mobile: company.phone,
      email: company.email,
      loginSessionId
    });

    const companyRes = company.toObject();
    delete companyRes.passwordHash;
    delete companyRes.__v;
    companyRes.id = company._id;
    companyRes.role = 'b2b';

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token: tokens.accessToken,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      company: companyRes,
      role: 'b2b',
      profileId: company._id.toString()
    });
  } catch (error) {
    console.error('B2B Login Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message
    });
  }
};

/**
 * Get current logged in B2B profile
 */
const getProfile = async (req, res) => {
  try {
    const company = await B2BCompany.findById(req.user.id).select('-passwordHash');
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company profile not found'
      });
    }
    return res.status(200).json({
      success: true,
      company
    });
  } catch (error) {
    console.error('B2B Get Profile Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve profile data',
      error: error.message
    });
  }
};

/**
 * Update profile details
 */
const updateProfile = async (req, res) => {
  try {
    const {
      companyName,
      companyAddress,
      billingAddress,
      branches,
      authorizedPerson,
      logoUrl
    } = req.body;

    const company = await B2BCompany.findById(req.user.id);
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company profile not found'
      });
    }

    if (companyName) company.companyName = companyName;
    if (companyAddress) company.companyAddress = companyAddress;
    if (billingAddress) company.billingAddress = billingAddress;
    if (branches) company.branches = branches;
    if (logoUrl) company.logoUrl = logoUrl;
    
    if (authorizedPerson) {
      company.authorizedPerson = {
        ...company.authorizedPerson,
        ...authorizedPerson
      };
    }

    await company.save();

    const updatedCompany = company.toObject();
    delete updatedCompany.passwordHash;

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      company: updatedCompany
    });
  } catch (error) {
    console.error('B2B Update Profile Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update profile details',
      error: error.message
    });
  }
};

/**
 * Re-upload document if rejected
 */
const reuploadDocuments = async (req, res) => {
  try {
    // If rejected, the frontend sends documents to re-evaluate
    const { companyId, documents } = req.body;
    
    // Find the company
    const company = await B2BCompany.findById(companyId || req.user?.id);
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'B2B Company not found'
      });
    }

    if (!documents || documents.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No documents provided for re-upload'
      });
    }

    // Update company documents array
    for (const newDoc of documents) {
      const existingDocIndex = company.documents.findIndex(d => d.documentType === newDoc.documentType);
      if (existingDocIndex > -1) {
        company.documents[existingDocIndex].fileUrl = newDoc.fileUrl;
        company.documents[existingDocIndex].fileKey = newDoc.fileKey || null;
        company.documents[existingDocIndex].status = 'uploaded';
        company.documents[existingDocIndex].rejectionReason = null;
        company.documents[existingDocIndex].uploadedAt = new Date();
      } else {
        company.documents.push({
          documentType: newDoc.documentType,
          fileUrl: newDoc.fileUrl,
          fileKey: newDoc.fileKey || null,
          status: 'uploaded',
          uploadedAt: new Date()
        });
      }

      // Update granularity collection B2BDocument
      await B2BDocument.findOneAndUpdate(
        { companyId: company._id, documentType: newDoc.documentType },
        {
          fileUrl: newDoc.fileUrl,
          fileKey: newDoc.fileKey || null,
          status: 'uploaded',
          rejectionReason: null,
          uploadedAt: new Date()
        },
        { upsert: true, new: true }
      );
    }

    // Reset status back to pending
    company.verificationStatus = 'pending';
    company.rejectionReason = null;
    await company.save();

    return res.status(200).json({
      success: true,
      message: 'Documents updated and registration re-submitted for approval successfully.'
    });
  } catch (error) {
    console.error('B2B Re-upload Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update documents',
      error: error.message
    });
  }
};

/**
 * Get current verification status
 */
const getVerificationStatus = async (req, res) => {
  try {
    const company = await B2BCompany.findById(req.user.id).select('verificationStatus rejectionReason documents');
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }
    return res.status(200).json({
      success: true,
      verificationStatus: company.verificationStatus,
      rejectionReason: company.rejectionReason,
      documents: company.documents
    });
  } catch (error) {
    console.error('B2B Verification Status Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve verification status',
      error: error.message
    });
  }
};

module.exports = {
  registerCompany,
  loginCompany,
  getProfile,
  updateProfile,
  reuploadDocuments,
  getVerificationStatus
};
