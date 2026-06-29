const mongoose = require('mongoose');
const fs = require('fs');
const XLSX = require('xlsx');

const B2BBatch = require('../../models/B2BBatch');
const B2BBatchErrors = require('../../models/B2BBatchErrors');
const B2BJob = require('../../models/B2BJob');
const B2BCompany = require('../../models/B2BCompany');
const B2BWallet = require('../../models/B2BWallet');
const B2BDeductionRule = require('../../models/B2BDeductionRule');
const UploadReport = require('../../models/UploadReport');
const AuditLog = require('../../models/AuditLog');

const b2bBulkJobService = require('../../services/b2bBulkJobService');
const { bulkJobQueue } = require('../../services/b2bBulkJobQueueService');

/**
 * GET Dashboard Statistics
 */
const getStats = async (req, res) => {
  try {
    const companyId = new mongoose.Types.ObjectId(req.user.id);

    // 1. Fetch total batch uploads
    const totalUploads = await B2BBatch.countDocuments({ companyId });

    // 2. Fetch jobs uploaded
    const jobsUploaded = await B2BJob.countDocuments({ companyId });

    // 3. Fetch processing batches
    const processingJobs = await B2BBatch.countDocuments({ companyId, status: 'processing' });

    // 4. Aggregate failed rows
    const failedRowsAggregate = await B2BBatch.aggregate([
      { $match: { companyId } },
      { $group: { _id: null, count: { $sum: '$invalidRows' } } }
    ]);
    const failedRows = failedRowsAggregate[0] ? failedRowsAggregate[0].count : 0;

    // 4b. Aggregate total rows
    const totalRowsAggregate = await B2BBatch.aggregate([
      { $match: { companyId } },
      { $group: { _id: null, count: { $sum: '$totalRows' } } }
    ]);
    const totalRows = totalRowsAggregate[0] ? totalRowsAggregate[0].count : 0;

    // 5. Fetch wallet balance
    const company = await B2BCompany.findById(req.user.id).select('walletBalance');
    const walletBalance = company ? company.walletBalance : 0;

    return res.status(200).json({
      success: true,
      stats: {
        totalUploads,
        jobsUploaded,
        processingJobs,
        failedRows,
        totalRows,
        walletBalance
      }
    });
  } catch (error) {
    console.error('[B2B Bulk Stats Error]:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve bulk stats summary' });
  }
};

/**
 * GET Download Sample layout
 */
const downloadSample = (req, res) => {
  try {
    const buffer = b2bBulkJobService.generateSampleExcelBuffer();
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=WBI_B2B_Bulk_Jobs_Sample.xlsx');
    res.send(buffer);
  } catch (error) {
    console.error('[B2B Sample Download Error]:', error);
    res.status(500).json({ success: false, message: 'Failed to build sample excel template' });
  }
};

/**
 * POST Excel/CSV File Upload
 */
const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please provide a valid Excel or CSV file' });
    }

    const companyId = req.user.id;
    const company = await B2BCompany.findById(companyId);
    if (!company || company.verificationStatus !== 'approved' || !company.isActive) {
      return res.status(403).json({ success: false, message: 'Only active, approved corporate partners can upload batches' });
    }

    // Retrieve active deduction rules
    let rule = await B2BDeductionRule.findOne({ companyId, isActive: true });
    if (!rule) {
      rule = await B2BDeductionRule.create({ companyId, perJobCharge: 12, gstPercent: 18, isActive: true });
    }

    // Get current wallet balance
    let wallet = await B2BWallet.findOne({ companyId });
    if (!wallet) {
      wallet = await B2BWallet.create({ companyId, balance: 0 });
    }

    const batchId = `BATCH-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Create Batch Metadata in DB
    const batch = await B2BBatch.create({
      companyId,
      batchId,
      fileName: req.file.originalname,
      fileUrl: req.file.path, // Store local path of uploaded file
      status: 'draft',
      totalRows: 0,
      walletBalanceAtUpload: wallet.balance,
      perJobCharge: rule.perJobCharge,
      createdBy: companyId
    });

    // Log Action
    await AuditLog.create({
      actionType: 'BANK_DETAILS_UPDATE', // Reusing available enum value to satisfy schema validator constraint
      actorId: companyId,
      actorRole: 'company',
      targetId: batch._id,
      targetType: 'B2BBatch',
      changes: { fileName: req.file.originalname, status: 'uploaded' }
    });

    // Enqueue Validation Job in BullMQ
    await bulkJobQueue.add('validateBatch', { batchId: batch._id.toString() });

    return res.status(201).json({
      success: true,
      message: 'File uploaded. Validation queue initiated.',
      batch: {
        id: batch._id,
        batchId: batch.batchId,
        fileName: batch.fileName,
        status: 'validating'
      }
    });
  } catch (error) {
    console.error('[B2B Bulk Upload Error]:', error);
    res.status(500).json({ success: false, message: 'Failed to process spreadsheet upload' });
  }
};

/**
 * GET Upload History
 */
const getHistory = async (req, res) => {
  try {
    const companyId = req.user.id;
    const { status, search, page = 1, limit = 10, startDate, endDate, minRows, maxRows, service } = req.query;

    const filter = { companyId };
    if (status) {
      filter.status = status;
    }
    if (search) {
      filter.$or = [
        { fileName: { $regex: search, $options: 'i' } },
        { batchId: { $regex: search, $options: 'i' } }
      ];
    }
    if (startDate && endDate) {
      filter.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    if (minRows || maxRows) {
      filter.totalRows = {};
      if (minRows) filter.totalRows.$gte = parseInt(minRows, 10);
      if (maxRows) filter.totalRows.$lte = parseInt(maxRows, 10);
    }
    if (service) {
      filter.serviceSummary = { $in: [service] };
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skipNum = (pageNum - 1) * limitNum;

    const batches = await B2BBatch.find(filter)
      .sort({ createdAt: -1 })
      .skip(skipNum)
      .limit(limitNum);

    const total = await B2BBatch.countDocuments(filter);

    return res.status(200).json({
      success: true,
      batches,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('[B2B History Error]:', error);
    res.status(500).json({ success: false, message: 'Failed to query batch upload history' });
  }
};

/**
 * GET Batch Details
 */
const getBatchDetails = async (req, res) => {
  try {
    const companyId = req.user.id;
    const batch = await B2BBatch.findOne({ _id: req.params.batchId, companyId });

    if (!batch) {
      return res.status(404).json({ success: false, message: 'Batch not found or unauthorized access' });
    }

    return res.status(200).json({
      success: true,
      batch
    });
  } catch (error) {
    console.error('[B2B Details Error]:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch batch metrics' });
  }
};

/**
 * GET Batch Errors
 */
const getBatchErrors = async (req, res) => {
  try {
    const companyId = req.user.id;
    const batch = await B2BBatch.findOne({ _id: req.params.batchId, companyId });

    if (!batch) {
      return res.status(404).json({ success: false, message: 'Batch not found' });
    }

    const { page = 1, limit = 20 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skipNum = (pageNum - 1) * limitNum;

    const errors = await B2BBatchErrors.find({ batchId: batch._id })
      .sort({ rowNumber: 1 })
      .skip(skipNum)
      .limit(limitNum);

    const total = await B2BBatchErrors.countDocuments({ batchId: batch._id });

    return res.status(200).json({
      success: true,
      errors,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('[B2B Errors Fetch Error]:', error);
    res.status(500).json({ success: false, message: 'Failed to resolve error grid list' });
  }
};

/**
 * GET Download Error Report Excel
 */
const downloadErrorReport = async (req, res) => {
  try {
    const companyId = req.user.id;
    const batch = await B2BBatch.findOne({ _id: req.params.batchId, companyId });

    if (!batch) {
      return res.status(404).json({ success: false, message: 'Batch not found' });
    }

    const errors = await B2BBatchErrors.find({ batchId: batch._id }).sort({ rowNumber: 1 });

    const errorRows = errors.map(err => ({
      'Row Number': err.rowNumber,
      'Customer Name': err.rowData.customerName || 'N/A',
      'Phone': err.rowData.phone || 'N/A',
      'Address': err.rowData.address || 'N/A',
      'City': err.rowData.city || 'N/A',
      'Pincode': err.rowData.pincode || 'N/A',
      'Service Name': err.rowData.service || 'N/A',
      'Validation Failure Reason(s)': err.errors.join(' | ')
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(errorRows);

    // Auto-fit column widths
    const maxCols = [12, 20, 15, 35, 15, 12, 20, 50];
    ws['!cols'] = maxCols.map(w => ({ wch: w }));

    XLSX.utils.book_append_sheet(wb, ws, 'Validation Failures');
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=error_report_${batch.batchId}.xlsx`);
    res.send(buffer);
  } catch (error) {
    console.error('[B2B Error Report Export Error]:', error);
    res.status(500).json({ success: false, message: 'Failed to generate excel error sheet' });
  }
};

/**
 * POST Confirm Upload (Triggers Job Creation queue)
 */
const confirmUpload = async (req, res) => {
  try {
    const companyId = req.user.id;
    const batch = await B2BBatch.findOne({ _id: req.params.batchId, companyId });

    if (!batch) {
      return res.status(404).json({ success: false, message: 'Batch record not found' });
    }

    if (batch.status !== 'validated') {
      return res.status(400).json({ success: false, message: `Cannot confirm upload. Batch status is '${batch.status}' (expected 'validated')` });
    }

    if (batch.validRows === 0) {
      return res.status(400).json({ success: false, message: 'This batch has 0 valid rows. Cannot create jobs.' });
    }

    // Verify company account is active and approved
    const company = await B2BCompany.findById(companyId);
    if (!company || company.verificationStatus !== 'approved' || !company.isActive) {
      return res.status(403).json({ success: false, message: 'Your corporate account status blocks job scheduling.' });
    }

    // Verify Wallet Balance
    const wallet = await B2BWallet.findOne({ companyId });
    if (!wallet || wallet.balance < batch.estimatedCost) {
      return res.status(400).json({
        success: false,
        insufficientBalance: true,
        required: batch.estimatedCost,
        balance: wallet ? wallet.balance : 0,
        message: `Insufficient wallet balance. Estimated cost is ₹${batch.estimatedCost.toLocaleString('en-IN')}, but balance is ₹${wallet ? wallet.balance.toLocaleString('en-IN') : 0}. Please top up first.`
      });
    }

    // Duplicate confirmation check (checks if batch is already confirmed recently)
    const duplicateBatch = await B2BBatch.findOne({
      companyId,
      status: { $in: ['processing', 'completed'] },
      fileName: batch.fileName,
      totalRows: batch.totalRows,
      _id: { $ne: batch._id },
      createdAt: { $gte: new Date(Date.now() - 30 * 60 * 1000) } // within last 30 minutes
    });

    if (duplicateBatch) {
      return res.status(400).json({
        success: false,
        message: 'A similar batch file is currently processing or completed within the last 30 minutes. To prevent duplication, confirmation is blocked.'
      });
    }

    // Set batch status to validating queue for processing
    batch.status = 'processing';
    await batch.save();

    // Trigger BullMQ job creation worker
    await bulkJobQueue.add('createJobs', { batchId: batch._id.toString() });

    return res.status(200).json({
      success: true,
      message: 'Job creation started in background matching queue.',
      status: 'processing'
    });
  } catch (error) {
    console.error('[B2B Confirm Error]:', error);
    res.status(500).json({ success: false, message: 'Failed to queue job creation dispatch' });
  }
};

/**
 * DELETE Batch draft/errors
 */
const deleteBatch = async (req, res) => {
  try {
    const companyId = req.user.id;
    const batch = await B2BBatch.findOne({ _id: req.params.batchId, companyId });

    if (!batch) {
      return res.status(404).json({ success: false, message: 'Batch not found' });
    }

    if (['processing', 'completed'].includes(batch.status)) {
      return res.status(400).json({ success: false, message: 'Cannot delete a batch that has already been dispatched' });
    }

    // Delete errors from DB
    await B2BBatchErrors.deleteMany({ batchId: batch._id });
    await UploadReport.deleteMany({ batchId: batch._id });

    // Try deleting the local file safely
    try {
      if (fs.existsSync(batch.fileUrl)) {
        fs.unlinkSync(batch.fileUrl);
      }
    } catch (fsErr) {
      console.warn('[FS Warning] File could not be deleted:', fsErr.message);
    }

    await B2BBatch.findByIdAndDelete(batch._id);

    return res.status(200).json({
      success: true,
      message: 'Draft batch aborted and deleted successfully'
    });
  } catch (error) {
    console.error('[B2B Delete Batch Error]:', error);
    res.status(500).json({ success: false, message: 'Failed to purge batch records' });
  }
};

/**
 * GET Download Original Uploaded File
 */
const downloadOriginalFile = async (req, res) => {
  try {
    const companyId = req.user.id;
    const batch = await B2BBatch.findOne({ _id: req.params.batchId, companyId });

    if (!batch || !batch.fileUrl || !fs.existsSync(batch.fileUrl)) {
      return res.status(404).json({ success: false, message: 'File not found or no longer exists' });
    }

    res.download(batch.fileUrl, batch.fileName);
  } catch (error) {
    console.error('[B2B Original File Download Error]:', error);
    res.status(500).json({ success: false, message: 'Failed to download original file' });
  }
};

/**
 * POST Retry Failed Batch
 */
const retryBatch = async (req, res) => {
  try {
    const companyId = req.user.id;
    const batch = await B2BBatch.findOne({ _id: req.params.batchId, companyId });

    if (!batch) {
      return res.status(404).json({ success: false, message: 'Batch not found' });
    }

    if (batch.status !== 'failed' && batch.status !== 'draft') {
      return res.status(400).json({ success: false, message: `Cannot retry batch with status '${batch.status}'` });
    }

    if (!fs.existsSync(batch.fileUrl)) {
      return res.status(400).json({ success: false, message: 'Original file missing. Please upload a new file.' });
    }

    // Reset counts and status
    batch.status = 'validating';
    batch.totalRows = 0;
    batch.processedRows = 0;
    batch.validRows = 0;
    batch.invalidRows = 0;
    batch.duplicates = 0;
    batch.failureReason = null;
    await batch.save();

    // Clear old errors
    await B2BBatchErrors.deleteMany({ batchId: batch._id });

    // Enqueue for validation again
    await bulkJobQueue.add('validateBatch', { batchId: batch._id.toString() });

    return res.status(200).json({
      success: true,
      message: 'Batch queued for re-validation.',
      status: 'validating'
    });
  } catch (error) {
    console.error('[B2B Retry Batch Error]:', error);
    res.status(500).json({ success: false, message: 'Failed to retry batch' });
  }
};

module.exports = {
  getStats,
  downloadSample,
  uploadFile,
  getHistory,
  getBatchDetails,
  getBatchErrors,
  downloadErrorReport,
  confirmUpload,
  deleteBatch,
  downloadOriginalFile,
  retryBatch
};
