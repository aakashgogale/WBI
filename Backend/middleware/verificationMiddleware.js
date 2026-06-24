const VerificationDocument = require('../models/VerificationDocument');
const BankAccount = require('../models/BankAccount');

/**
 * Middleware: Blocks job match and assignments if Aadhaar or PAN is not verified
 */
const VerificationConfig = require('../models/VerificationConfig');

/**
 * Middleware: Blocks job match and assignments if required documents are not verified
 */
const verifyAadhaarPanForJob = async (req, res, next) => {
  try {
    const ownerId = req.user.id || (req.user && req.user._id);
    const ownerType = req.userRole?.toLowerCase() === 'engineer' ? 'engineer' : 'worker';

    const config = await VerificationConfig.findOne({ roleType: ownerType });
    const requiredDocs = config?.requiredDocuments || ['aadhaar', 'pan'];

    if (requiredDocs.length > 0) {
      const verifiedDocsCount = await VerificationDocument.countDocuments({
        ownerId,
        documentType: { $in: requiredDocs },
        status: 'verified'
      });

      if (verifiedDocsCount < requiredDocs.length) {
        return res.status(403).json({
          success: false,
          message: `Job assignment blocked: Required verification documents (${requiredDocs.join(', ')}) must be verified first.`
        });
      }
    }

    next();
  } catch (error) {
    console.error('Safeguard check error:', error);
    res.status(500).json({ success: false, message: 'Verification safeguard validation failed' });
  }
};

/**
 * Middleware: Blocks wallet withdrawals if primary bank account is not verified
 */
const verifyBankForWithdrawal = async (req, res, next) => {
  try {
    const role = req.userRole || (req.user && req.user.role);
    // Only enforce for workers and engineers
    if (role !== 'worker' && role !== 'engineer') {
      return next();
    }

    const ownerId = req.user.id || (req.user && req.user._id);

    const bankAccount = await BankAccount.findOne({ ownerId, verificationStatus: 'verified' });
    if (!bankAccount) {
      return res.status(403).json({
        success: false,
        message: 'Withdrawal blocked: Please link and verify your bank details first.'
      });
    }

    next();
  } catch (error) {
    console.error('Bank safeguard check error:', error);
    res.status(500).json({ success: false, message: 'Bank verification safeguard check failed' });
  }
};

module.exports = {
  verifyAadhaarPanForJob,
  verifyBankForWithdrawal
};
