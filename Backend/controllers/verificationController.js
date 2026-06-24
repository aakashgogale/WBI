const VerificationConfig = require('../models/VerificationConfig');
const VerificationDocument = require('../models/VerificationDocument');
const VerificationRequest = require('../models/VerificationRequest');
const VerificationLog = require('../models/VerificationLog');
const BankAccount = require('../models/BankAccount');
const Worker = require('../models/Worker');
const Engineer = require('../models/Engineer');
const cgpeService = require('../services/cgpeService');
const { encrypt, maskAccountNumber } = require('../utils/encryption');

// Helper to get Owner profile model
const getOwnerModel = (ownerType) => {
  return ownerType === 'engineer' ? Engineer : Worker;
};

// Helper to mask Aadhaar and PAN numbers securely
const maskDocNumber = (docType, value) => {
  if (!value) return '';
  const clean = value.replace(/[^a-zA-Z0-9]/g, '');
  if (docType === 'aadhaar') {
    return 'XXXX-XXXX-' + clean.slice(-4);
  }
  if (docType === 'pan') {
    return clean.slice(0, 2) + 'XXXXX' + clean.slice(-3);
  }
  return 'XXXX-' + clean.slice(-4);
};

/**
 * Upload Verification Document (Private Cloudinary storage)
 */
exports.uploadDocument = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const ownerType = req.userRole.toLowerCase() === 'engineer' ? 'engineer' : 'worker';
    const { documentType } = req.body;

    if (!documentType) {
      return res.status(400).json({ success: false, message: 'documentType is required' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // Find configured requirement for verification
    const config = await VerificationConfig.findOne({ roleType: ownerType });
    const allowedDocs = [
      ...(config?.requiredDocuments || []),
      ...(config?.optionalDocuments || [])
    ];

    if (allowedDocs.length > 0 && !allowedDocs.includes(documentType)) {
      return res.status(400).json({ 
        success: false, 
        message: `Document type '${documentType}' is not allowed or configured for role ${ownerType}` 
      });
    }

    // Save or update VerificationDocument
    let doc = await VerificationDocument.findOne({ ownerId, documentType });
    if (doc) {
      doc.fileUrl = req.file.path;
      doc.fileKey = req.file.filename;
      doc.status = 'uploaded';
      doc.rejectionReason = undefined;
      doc.verifiedAt = undefined;
      doc.reviewedBy = undefined;
      await doc.save();
    } else {
      doc = await VerificationDocument.create({
        ownerId,
        ownerType,
        documentType,
        fileUrl: req.file.path,
        fileKey: req.file.filename,
        status: 'uploaded'
      });
    }

    // Synchronize request state
    let request = await VerificationRequest.findOne({ ownerId });
    if (!request) {
      request = await VerificationRequest.create({
        ownerId,
        ownerType,
        overallStatus: 'not_submitted',
        requiredDocuments: config?.requiredDocuments || [],
        submittedDocuments: [documentType]
      });
    } else {
      if (!request.submittedDocuments.includes(documentType)) {
        request.submittedDocuments.push(documentType);
      }
      // Remove from rejected if it was uploaded again
      request.rejectedDocuments = request.rejectedDocuments.filter(d => d !== documentType);
      await request.save();
    }

    // Decrypting details for frontend response
    res.status(200).json({
      success: true,
      message: 'Document uploaded successfully',
      data: {
        documentType: doc.documentType,
        status: doc.status,
        createdAt: doc.createdAt
      }
    });

  } catch (error) {
    console.error('Upload document error:', error);
    res.status(500).json({ success: false, message: 'Failed to upload document' });
  }
};

/**
 * Get current verification request and documents status
 */
exports.getMyStatus = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const ownerType = req.userRole.toLowerCase() === 'engineer' ? 'engineer' : 'worker';

    // Retrieve active configuration
    const config = await VerificationConfig.findOne({ roleType: ownerType }) || {
      requiredDocuments: ownerType === 'worker' ? ['aadhaar', 'pan', 'selfie', 'bank_details', 'address_proof'] : ['aadhaar', 'pan', 'selfie', 'education_certificate', 'experience_certificate', 'skill_certificate', 'bank_details'],
      optionalDocuments: ownerType === 'worker' ? ['skill_certificate', 'experience_proof', 'police_verification'] : ['resume'],
      autoVerificationEnabled: true,
      manualReviewRequired: true
    };

    let request = await VerificationRequest.findOne({ ownerId });
    if (!request) {
      request = await VerificationRequest.create({
        ownerId,
        ownerType,
        overallStatus: 'not_submitted',
        requiredDocuments: config.requiredDocuments,
        submittedDocuments: [],
        verifiedDocuments: [],
        rejectedDocuments: []
      });
    }

    const docs = await VerificationDocument.find({ ownerId });

    // Build complete listing of all documents with status mapping
    const documentStatusList = {};
    const allConfiguredDocs = [...config.requiredDocuments, ...config.optionalDocuments];

    allConfiguredDocs.forEach(docType => {
      const existingDoc = docs.find(d => d.documentType === docType);
      if (existingDoc) {
        documentStatusList[docType] = {
          uploaded: true,
          status: existingDoc.status,
          rejectionReason: existingDoc.rejectionReason,
          documentNumberMasked: existingDoc.documentNumberMasked,
          matchScore: existingDoc.matchScore,
          verifiedAt: existingDoc.verifiedAt,
          updatedAt: existingDoc.updatedAt
        };
      } else {
        documentStatusList[docType] = {
          uploaded: false,
          status: 'pending',
          isRequired: config.requiredDocuments.includes(docType)
        };
      }
    });

    res.status(200).json({
      success: true,
      data: {
        overallStatus: request.overallStatus,
        adminReviewStatus: request.adminReviewStatus,
        requiredDocuments: config.requiredDocuments,
        optionalDocuments: config.optionalDocuments,
        documents: documentStatusList
      }
    });

  } catch (error) {
    console.error('Get status error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch status details' });
  }
};

/**
 * Submit all documents for final verification request
 */
exports.submitRequest = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const ownerType = req.userRole.toLowerCase() === 'engineer' ? 'engineer' : 'worker';

    const config = await VerificationConfig.findOne({ roleType: ownerType });
    const requiredDocs = config?.requiredDocuments || [];

    const request = await VerificationRequest.findOne({ ownerId });
    if (!request) {
      return res.status(400).json({ success: false, message: 'No documents uploaded yet.' });
    }

    // Verify all required documents are uploaded
    const missingDocs = requiredDocs.filter(d => !request.submittedDocuments.includes(d));
    if (missingDocs.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot submit. Missing required documents: ${missingDocs.join(', ')}` 
      });
    }

    // Determine verification state
    const verifiedDocs = await VerificationDocument.find({ ownerId, status: 'verified' });
    const verifiedKeys = verifiedDocs.map(d => d.documentType);
    
    // Check if fully verified immediately (e.g. all auto-verified)
    const allRequiredVerified = requiredDocs.every(d => verifiedKeys.includes(d));
    
    request.overallStatus = allRequiredVerified ? 'verified' : 'pending_verification';
    request.adminReviewStatus = allRequiredVerified ? 'approved' : 'pending';
    await request.save();

    // Sync status to the user profile
    const ProfileModel = getOwnerModel(ownerType);
    await ProfileModel.findByIdAndUpdate(ownerId, {
      'documents.status': allRequiredVerified ? 'Approved' : 'Pending',
      approvalStatus: allRequiredVerified ? 'approved' : 'pending'
    });

    res.status(200).json({
      success: true,
      message: allRequiredVerified ? 'Verification request approved automatically' : 'Verification request submitted for admin review',
      data: {
        overallStatus: request.overallStatus,
        adminReviewStatus: request.adminReviewStatus
      }
    });

  } catch (error) {
    console.error('Submit request error:', error);
    res.status(500).json({ success: false, message: 'Failed to submit verification request' });
  }
};

/**
 * Trigger Aadhaar Verification using CGPE
 */
exports.verifyAadhaar = async (req, res) => {
  const logData = {
    ownerId: req.user.id,
    ownerType: req.userRole.toLowerCase() === 'engineer' ? 'engineer' : 'worker',
    documentType: 'aadhaar',
    apiType: 'aadhaar_verify'
  };

  try {
    const { aadhaarNumber } = req.body;
    if (!aadhaarNumber || aadhaarNumber.length !== 12 || isNaN(aadhaarNumber)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid 12-digit Aadhaar number' });
    }

    logData.requestPayload = { aadhaarNumberMasked: maskDocNumber('aadhaar', aadhaarNumber) };

    const cgpeResult = await cgpeService.verifyAadhaar(aadhaarNumber);

    logData.responsePayload = cgpeResult;
    logData.status = 'success';
    await VerificationLog.create(logData);

    const doc = await VerificationDocument.findOneAndUpdate(
      { ownerId: logData.ownerId, documentType: 'aadhaar' },
      {
        status: 'verified',
        documentNumberMasked: maskDocNumber('aadhaar', aadhaarNumber),
        cgpeRequestId: cgpeResult.requestId,
        cgpeResponse: cgpeResult.data,
        verifiedAt: new Date()
      },
      { new: true, upsert: true }
    );

    // Update VerificationRequest
    await VerificationRequest.findOneAndUpdate(
      { ownerId: logData.ownerId },
      { 
        $addToSet: { submittedDocuments: 'aadhaar', verifiedDocuments: 'aadhaar' },
        $pull: { rejectedDocuments: 'aadhaar' }
      },
      { upsert: true }
    );

    // Sync to profile
    const ProfileModel = getOwnerModel(logData.ownerType);
    await ProfileModel.findByIdAndUpdate(logData.ownerId, {
      'aadhar.number': maskDocNumber('aadhaar', aadhaarNumber) // Masked
    });

    res.status(200).json({
      success: true,
      message: 'Aadhaar verified successfully',
      data: {
        fullName: cgpeResult.data.fullName,
        state: cgpeResult.data.state,
        status: doc.status
      }
    });

  } catch (error) {
    console.error('Aadhaar verification error:', error);
    logData.status = 'failed';
    logData.errorMessage = error.message;
    await VerificationLog.create(logData);

    res.status(400).json({ 
      success: false, 
      message: `Aadhaar verification failed: ${error.message}. Please retry with correct details.` 
    });
  }
};

/**
 * Trigger PAN Verification using CGPE
 */
exports.verifyPan = async (req, res) => {
  const logData = {
    ownerId: req.user.id,
    ownerType: req.userRole.toLowerCase() === 'engineer' ? 'engineer' : 'worker',
    documentType: 'pan',
    apiType: 'pan_verify'
  };

  try {
    const { panNumber, fullName, dob } = req.body;
    if (!panNumber || panNumber.length !== 10) {
      return res.status(400).json({ success: false, message: 'Please provide a valid 10-character PAN number' });
    }
    if (!fullName) {
      return res.status(400).json({ success: false, message: 'Please provide your full name as per PAN' });
    }

    logData.requestPayload = { 
      panNumberMasked: maskDocNumber('pan', panNumber),
      fullName,
      dob
    };

    const cgpeResult = await cgpeService.verifyPan(panNumber.toUpperCase(), fullName, dob);

    logData.responsePayload = cgpeResult;
    logData.status = 'success';
    await VerificationLog.create(logData);

    const doc = await VerificationDocument.findOneAndUpdate(
      { ownerId: logData.ownerId, documentType: 'pan' },
      {
        status: 'verified',
        documentNumberMasked: maskDocNumber('pan', panNumber),
        cgpeRequestId: cgpeResult.requestId,
        cgpeResponse: cgpeResult.data,
        verifiedAt: new Date()
      },
      { new: true, upsert: true }
    );

    // Update VerificationRequest
    await VerificationRequest.findOneAndUpdate(
      { ownerId: logData.ownerId },
      { 
        $addToSet: { submittedDocuments: 'pan', verifiedDocuments: 'pan' },
        $pull: { rejectedDocuments: 'pan' }
      },
      { upsert: true }
    );

    // Sync to profile
    const ProfileModel = getOwnerModel(logData.ownerType);
    await ProfileModel.findByIdAndUpdate(logData.ownerId, {
      'pan.number': maskDocNumber('pan', panNumber) // Masked
    });

    res.status(200).json({
      success: true,
      message: 'PAN verified successfully',
      data: {
        fullName: cgpeResult.data.fullName,
        status: doc.status
      }
    });

  } catch (error) {
    console.error('PAN verification error:', error);
    logData.status = 'failed';
    logData.errorMessage = error.message;
    await VerificationLog.create(logData);

    res.status(400).json({ 
      success: false, 
      message: `PAN verification failed: ${error.message}. Please retry with correct details.` 
    });
  }
};

/**
 * Trigger Bank Account Verification using CGPE
 */
exports.verifyBankDetails = async (req, res) => {
  const logData = {
    ownerId: req.user.id,
    ownerType: req.userRole.toLowerCase() === 'engineer' ? 'engineer' : 'worker',
    documentType: 'bank_details',
    apiType: 'bank_verify'
  };

  try {
    const { accountNumber, ifsc, accountHolderName } = req.body;
    if (!accountNumber || !ifsc || !accountHolderName) {
      return res.status(400).json({ success: false, message: 'accountNumber, ifsc, and accountHolderName are required' });
    }

    logData.requestPayload = {
      accountNumberMasked: maskAccountNumber(accountNumber),
      ifsc,
      accountHolderName
    };

    const cgpeResult = await cgpeService.verifyBank(accountNumber, ifsc);

    logData.responsePayload = cgpeResult;
    logData.status = 'success';
    await VerificationLog.create(logData);

    // Save BankAccount entry (encrypted)
    const encryptedAccountNumber = encrypt(accountNumber);
    let bankAccount = await BankAccount.findOne({ ownerId: logData.ownerId });
    if (bankAccount) {
      bankAccount.accountHolderName = accountHolderName;
      bankAccount.accountNumberEncrypted = encryptedAccountNumber;
      bankAccount.ifsc = ifsc;
      bankAccount.bankName = cgpeResult.data.bankName || 'Unknown Bank';
      bankAccount.branchName = cgpeResult.data.branchName || '';
      bankAccount.verificationStatus = 'verified';
      await bankAccount.save();
    } else {
      bankAccount = await BankAccount.create({
        ownerId: logData.ownerId,
        ownerType: logData.ownerType,
        accountHolderName,
        accountNumberEncrypted: encryptedAccountNumber,
        ifsc,
        bankName: cgpeResult.data.bankName || 'Unknown Bank',
        branchName: cgpeResult.data.branchName || '',
        verificationStatus: 'verified',
        isPrimary: true
      });
    }

    // Sync to verification document
    const doc = await VerificationDocument.findOneAndUpdate(
      { ownerId: logData.ownerId, documentType: 'bank_details' },
      {
        status: 'verified',
        documentNumberMasked: maskAccountNumber(accountNumber),
        cgpeRequestId: cgpeResult.requestId,
        cgpeResponse: cgpeResult.data,
        verifiedAt: new Date()
      },
      { new: true, upsert: true }
    );

    // Update VerificationRequest
    await VerificationRequest.findOneAndUpdate(
      { ownerId: logData.ownerId },
      { 
        $addToSet: { submittedDocuments: 'bank_details', verifiedDocuments: 'bank_details' },
        $pull: { rejectedDocuments: 'bank_details' }
      },
      { upsert: true }
    );

    // Sync to profile models bankDetails
    const ProfileModel = getOwnerModel(logData.ownerType);
    await ProfileModel.findByIdAndUpdate(logData.ownerId, {
      bankDetails: {
        accountHolder: accountHolderName,
        accountNumber: maskAccountNumber(accountNumber),
        ifscCode: ifsc,
        bankName: cgpeResult.data.bankName || 'Unknown Bank'
      }
    });

    res.status(200).json({
      success: true,
      message: 'Bank account verified successfully',
      data: {
        accountHolderName: cgpeResult.data.accountHolderName,
        bankName: cgpeResult.data.bankName,
        status: doc.status
      }
    });

  } catch (error) {
    console.error('Bank verification error:', error);
    logData.status = 'failed';
    logData.errorMessage = error.message;
    await VerificationLog.create(logData);

    res.status(400).json({ 
      success: false, 
      message: `Bank details verification failed: ${error.message}. Please retry with correct details.` 
    });
  }
};

/**
 * Trigger Selfie Face Match Verification using CGPE
 */
exports.verifySelfieMatch = async (req, res) => {
  const logData = {
    ownerId: req.user.id,
    ownerType: req.userRole.toLowerCase() === 'engineer' ? 'engineer' : 'worker',
    documentType: 'selfie',
    apiType: 'selfie_verify'
  };

  try {
    // Selfie verification requires a selfie/live photo document AND a primary ID card document (Aadhaar or PAN)
    const selfieDoc = await VerificationDocument.findOne({ ownerId: logData.ownerId, documentType: 'selfie' });
    if (!selfieDoc) {
      return res.status(400).json({ success: false, message: 'Please upload your selfie/live photo first' });
    }

    const idDoc = await VerificationDocument.findOne({ 
      ownerId: logData.ownerId, 
      documentType: { $in: ['aadhaar', 'pan'] } 
    });
    if (!idDoc) {
      return res.status(400).json({ success: false, message: 'Please upload Aadhaar or PAN card first for face comparison' });
    }

    logData.requestPayload = {
      selfieUrl: selfieDoc.fileUrl,
      idDocUrl: idDoc.fileUrl,
      idType: idDoc.documentType
    };

    const cgpeResult = await cgpeService.verifySelfie(selfieDoc.fileUrl, idDoc.fileUrl);

    logData.responsePayload = cgpeResult;
    logData.status = 'success';
    await VerificationLog.create(logData);

    // Retrieve active configuration to check minimum match score
    const config = await VerificationConfig.findOne({ roleType: logData.ownerType });
    const minScore = config?.minMatchScore || 70;
    const matchScore = cgpeResult.data.matchScore || 0;

    const isMatched = matchScore >= minScore;

    const doc = await VerificationDocument.findOneAndUpdate(
      { ownerId: logData.ownerId, documentType: 'selfie' },
      {
        status: isMatched ? 'verified' : 'rejected',
        matchScore,
        cgpeRequestId: cgpeResult.requestId,
        cgpeResponse: cgpeResult.data,
        rejectionReason: isMatched ? undefined : `Face match score ${matchScore.toFixed(1)}% is below threshold of ${minScore}%`,
        verifiedAt: isMatched ? new Date() : undefined
      },
      { new: true }
    );

    // Update VerificationRequest status
    const reqUpdate = { $addToSet: { submittedDocuments: 'selfie' } };
    if (isMatched) {
      reqUpdate.$addToSet.verifiedDocuments = 'selfie';
      reqUpdate.$pull = { rejectedDocuments: 'selfie' };
    } else {
      reqUpdate.$addToSet.rejectedDocuments = 'selfie';
      reqUpdate.$pull = { verifiedDocuments: 'selfie' };
    }
    await VerificationRequest.findOneAndUpdate({ ownerId: logData.ownerId }, reqUpdate);

    if (isMatched) {
      res.status(200).json({
        success: true,
        message: 'Selfie matched and verified successfully',
        data: {
          matchScore,
          status: doc.status
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: `Selfie face mismatch (Score: ${matchScore.toFixed(1)}%). Re-upload standard bright photos.`,
        data: {
          matchScore,
          status: doc.status
        }
      });
    }

  } catch (error) {
    console.error('Selfie match error:', error);
    logData.status = 'failed';
    logData.errorMessage = error.message;
    await VerificationLog.create(logData);

    res.status(400).json({ 
      success: false, 
      message: `Selfie match failed: ${error.message}. Please retry with clear photos.` 
    });
  }
};
