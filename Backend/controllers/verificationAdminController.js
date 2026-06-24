const VerificationConfig = require('../models/VerificationConfig');
const VerificationDocument = require('../models/VerificationDocument');
const VerificationRequest = require('../models/VerificationRequest');
const VerificationLog = require('../models/VerificationLog');
const AdminActivityLog = require('../models/AdminActivityLog');
const BankAccount = require('../models/BankAccount');
const Worker = require('../models/Worker');
const Engineer = require('../models/Engineer');
const cloudinary = require('../config/cloudinary');

// Helper to get Owner profile model
const getOwnerModel = (ownerType) => {
  return ownerType === 'engineer' ? Engineer : Worker;
};

// Generates temporary secure signed Cloudinary URL for private/authenticated assets
const generateSignedUrl = (fileKey) => {
  if (!fileKey) return '';
  try {
    // Cloudinary SDK signed URL builder
    return cloudinary.url(fileKey, {
      resource_type: 'auto',
      type: 'authenticated',
      sign_url: true,
      expires_at: Math.floor(Date.now() / 1000) + 3600 // 1 hour expiration
    });
  } catch (error) {
    console.error('Failed to generate Cloudinary signed URL:', error);
    return '';
  }
};

/**
 * Seed Default Verification Configs if none exist
 */
const ensureDefaultConfigs = async () => {
  try {
    const workerCount = await VerificationConfig.countDocuments({ roleType: 'worker' });
    if (workerCount === 0) {
      await VerificationConfig.create({
        roleType: 'worker',
        requiredDocuments: ['aadhaar', 'pan', 'selfie', 'bank_details', 'address_proof'],
        optionalDocuments: ['skill_certificate', 'experience_proof', 'police_verification'],
        autoVerificationEnabled: true,
        manualReviewRequired: true,
        minMatchScore: 70
      });
    }

    const engineerCount = await VerificationConfig.countDocuments({ roleType: 'engineer' });
    if (engineerCount === 0) {
      await VerificationConfig.create({
        roleType: 'engineer',
        requiredDocuments: ['aadhaar', 'pan', 'selfie', 'education_certificate', 'experience_certificate', 'skill_certificate', 'bank_details'],
        optionalDocuments: ['resume'],
        autoVerificationEnabled: true,
        manualReviewRequired: true,
        minMatchScore: 70
      });
    }
  } catch (err) {
    console.error('Error seeding default configs:', err);
  }
};

// Initialize configuration seeding
ensureDefaultConfigs();

/**
 * List all verification requests
 */
exports.getVerifications = async (req, res) => {
  try {
    const { roleType, status, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (roleType) query.ownerType = roleType;
    if (status) query.overallStatus = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get requests
    const requests = await VerificationRequest.find(query)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await VerificationRequest.countDocuments(query);

    // Populate user profile details for each request
    const enrichedRequests = [];
    for (const r of requests) {
      const ProfileModel = getOwnerModel(r.ownerType);
      const profile = await ProfileModel.findById(r.ownerId).select('name phone email approvalStatus').lean();
      
      enrichedRequests.push({
        ...r,
        profile: profile || { name: 'Unknown User', phone: '', email: '' }
      });
    }

    res.status(200).json({
      success: true,
      data: enrichedRequests,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Get verifications list error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch verification list' });
  }
};

/**
 * Get individual verification request detail
 */
exports.getVerificationDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await VerificationRequest.findById(id).lean();
    if (!request) {
      return res.status(404).json({ success: false, message: 'Verification request not found' });
    }

    const ProfileModel = getOwnerModel(request.ownerType);
    const profile = await ProfileModel.findById(request.ownerId).select('-password').lean();

    const docs = await VerificationDocument.find({ ownerId: request.ownerId }).lean();

    // Map documents and generate signed URLs for private files
    const enrichedDocs = docs.map(d => ({
      ...d,
      signedPreviewUrl: generateSignedUrl(d.fileKey) || d.fileUrl // Fallback to raw URL if generation fails
    }));

    res.status(200).json({
      success: true,
      data: {
        request,
        profile,
        documents: enrichedDocs
      }
    });

  } catch (error) {
    console.error('Get verification detail error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch verification request details' });
  }
};

/**
 * Approve a specific document manually
 */
exports.approveDocument = async (req, res) => {
  try {
    const { id } = req.params; // Request ID
    const { documentType } = req.body;
    const adminId = req.user.id;

    if (!documentType) {
      return res.status(400).json({ success: false, message: 'documentType is required' });
    }

    const request = await VerificationRequest.findById(id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Verification request not found' });
    }

    const doc = await VerificationDocument.findOne({ ownerId: request.ownerId, documentType });
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    doc.status = 'verified';
    doc.rejectionReason = undefined;
    doc.verifiedAt = new Date();
    doc.reviewedBy = adminId;
    await doc.save();

    // Update Request tracking lists
    request.verifiedDocuments = [...new Set([...request.verifiedDocuments, documentType])];
    request.rejectedDocuments = request.rejectedDocuments.filter(d => d !== documentType);

    // Recalculate overall status
    const allRequiredVerified = request.requiredDocuments.every(d => request.verifiedDocuments.includes(d));
    if (allRequiredVerified) {
      request.overallStatus = 'verified';
      request.adminReviewStatus = 'approved';
      request.finalApprovedBy = adminId;
      request.finalApprovedAt = new Date();
      
      // Update profile status to approved
      const ProfileModel = getOwnerModel(request.ownerType);
      await ProfileModel.findByIdAndUpdate(request.ownerId, {
        approvalStatus: 'approved',
        'documents.status': 'Approved'
      });
    } else {
      request.overallStatus = 'partially_verified';
      request.adminReviewStatus = 'pending';
    }
    await request.save();

    // Log admin activity
    await AdminActivityLog.create({
      adminId,
      action: 'DOCUMENT_APPROVE',
      targetId: doc._id,
      targetType: 'VerificationDocument',
      details: { documentType, ownerId: request.ownerId },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.status(200).json({
      success: true,
      message: `Document ${documentType} approved successfully`,
      data: {
        document: doc,
        request
      }
    });

  } catch (error) {
    console.error('Approve document error:', error);
    res.status(500).json({ success: false, message: 'Failed to approve document' });
  }
};

/**
 * Reject a specific document manually
 */
exports.rejectDocument = async (req, res) => {
  try {
    const { id } = req.params; // Request ID
    const { documentType, rejectionReason } = req.body;
    const adminId = req.user.id;

    if (!documentType || !rejectionReason) {
      return res.status(400).json({ success: false, message: 'documentType and rejectionReason are required' });
    }

    const request = await VerificationRequest.findById(id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Verification request not found' });
    }

    const doc = await VerificationDocument.findOne({ ownerId: request.ownerId, documentType });
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    doc.status = 'rejected';
    doc.rejectionReason = rejectionReason;
    doc.verifiedAt = undefined;
    doc.reviewedBy = adminId;
    await doc.save();

    // Update Request tracking
    request.rejectedDocuments = [...new Set([...request.rejectedDocuments, documentType])];
    request.verifiedDocuments = request.verifiedDocuments.filter(d => d !== documentType);
    request.overallStatus = 'rejected';
    request.adminReviewStatus = 'rejected';
    await request.save();

    // Revert profile state
    const ProfileModel = getOwnerModel(request.ownerType);
    await ProfileModel.findByIdAndUpdate(request.ownerId, {
      approvalStatus: 'rejected',
      'documents.status': 'Rejected'
    });

    // Log admin activity
    await AdminActivityLog.create({
      adminId,
      action: 'DOCUMENT_REJECT',
      targetId: doc._id,
      targetType: 'VerificationDocument',
      details: { documentType, rejectionReason, ownerId: request.ownerId },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.status(200).json({
      success: true,
      message: `Document ${documentType} rejected successfully`,
      data: {
        document: doc,
        request
      }
    });

  } catch (error) {
    console.error('Reject document error:', error);
    res.status(500).json({ success: false, message: 'Failed to reject document' });
  }
};

/**
 * Request document re-upload
 */
exports.requestReupload = async (req, res) => {
  try {
    const { id } = req.params; // Request ID
    const { documentType, rejectionReason } = req.body;
    const adminId = req.user.id;

    if (!documentType || !rejectionReason) {
      return res.status(400).json({ success: false, message: 'documentType and rejectionReason are required' });
    }

    const request = await VerificationRequest.findById(id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Verification request not found' });
    }

    // Set document status to rejected and require reupload
    const doc = await VerificationDocument.findOne({ ownerId: request.ownerId, documentType });
    if (doc) {
      doc.status = 'rejected';
      doc.rejectionReason = `REUPLOAD_REQUESTED: ${rejectionReason}`;
      doc.verifiedAt = undefined;
      doc.reviewedBy = adminId;
      await doc.save();
    }

    // Update tracking
    request.rejectedDocuments = [...new Set([...request.rejectedDocuments, documentType])];
    request.submittedDocuments = request.submittedDocuments.filter(d => d !== documentType);
    request.verifiedDocuments = request.verifiedDocuments.filter(d => d !== documentType);
    request.overallStatus = 'rejected';
    request.adminReviewStatus = 'rejected';
    await request.save();

    // Trigger Notification to user
    const { createNotification } = require('../notificationControllers/notificationController');
    await createNotification({
      userId: request.ownerId,
      userModel: request.ownerType === 'engineer' ? 'Engineer' : 'Worker',
      type: 'document_reupload_requested',
      title: '⚠️ Document Re-upload Required',
      message: `Your uploaded ${documentType} requires re-upload. Reason: ${rejectionReason}`,
      relatedId: request._id,
      relatedType: 'verification_request',
      pushData: {
        type: 'document_reupload_requested',
        documentType
      }
    });

    // Revert profile state
    const ProfileModel = getOwnerModel(request.ownerType);
    await ProfileModel.findByIdAndUpdate(request.ownerId, {
      approvalStatus: 'pending',
      'documents.status': 'Rejected'
    });

    // Log admin activity
    await AdminActivityLog.create({
      adminId,
      action: 'DOCUMENT_REUPLOAD_REQUEST',
      targetId: request._id,
      targetType: 'VerificationRequest',
      details: { documentType, rejectionReason, ownerId: request.ownerId },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.status(200).json({
      success: true,
      message: `Re-upload of ${documentType} requested successfully`,
      data: request
    });

  } catch (error) {
    console.error('Request re-upload error:', error);
    res.status(500).json({ success: false, message: 'Failed to request document re-upload' });
  }
};

/**
 * Get dynamic verification configurations
 */
exports.getVerificationConfig = async (req, res) => {
  try {
    const configs = await VerificationConfig.find({});
    res.status(200).json({ success: true, data: configs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Edit verification configurations
 */
exports.updateVerificationConfig = async (req, res) => {
  try {
    const { roleType, requiredDocuments, optionalDocuments, autoVerificationEnabled, manualReviewRequired, minMatchScore, reuploadRules } = req.body;
    const adminId = req.user.id;

    if (!roleType || !['worker', 'engineer'].includes(roleType)) {
      return res.status(400).json({ success: false, message: 'roleType must be worker or engineer' });
    }

    let config = await VerificationConfig.findOne({ roleType });
    if (config) {
      if (requiredDocuments) config.requiredDocuments = requiredDocuments;
      if (optionalDocuments) config.optionalDocuments = optionalDocuments;
      if (autoVerificationEnabled !== undefined) config.autoVerificationEnabled = autoVerificationEnabled;
      if (manualReviewRequired !== undefined) config.manualReviewRequired = manualReviewRequired;
      if (minMatchScore !== undefined) config.minMatchScore = minMatchScore;
      if (reuploadRules) config.reuploadRules = reuploadRules;
      await config.save();
    } else {
      config = await VerificationConfig.create({
        roleType,
        requiredDocuments,
        optionalDocuments,
        autoVerificationEnabled,
        manualReviewRequired,
        minMatchScore,
        reuploadRules
      });
    }

    // Log config updates
    await AdminActivityLog.create({
      adminId,
      action: 'CONFIG_UPDATE',
      targetId: config._id,
      targetType: 'VerificationConfig',
      details: { roleType, changes: req.body },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.status(200).json({
      success: true,
      message: 'Verification config updated successfully',
      data: config
    });

  } catch (error) {
    console.error('Update config error:', error);
    res.status(500).json({ success: false, message: 'Failed to update verification config' });
  }
};

/**
 * View CGPE API verification logs
 */
exports.getVerificationLogs = async (req, res) => {
  try {
    const { ownerId, status, page = 1, limit = 50 } = req.query;
    const query = {};
    
    if (ownerId) query.ownerId = ownerId;
    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const logs = await VerificationLog.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await VerificationLog.countDocuments(query);

    res.status(200).json({
      success: true,
      data: logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get verification logs error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve verification logs' });
  }
};
