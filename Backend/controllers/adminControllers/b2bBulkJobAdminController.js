const mongoose = require('mongoose');

const B2BBatch = require('../../models/B2BBatch');
const B2BCompany = require('../../models/B2BCompany');
const B2BBatchErrors = require('../../models/B2BBatchErrors');
const B2BJob = require('../../models/B2BJob');
const B2BWallet = require('../../models/B2BWallet');
const AuditLog = require('../../models/AuditLog');

const { bulkJobQueue } = require('../../services/b2bBulkJobQueueService');

// Socket emission helper
const emitSocket = (room, event, data) => {
  try {
    const { getIO } = require('../../sockets');
    const io = getIO();
    if (io) {
      io.to(room).emit(event, data);
    }
  } catch (err) {
    console.error('[Socket Admin Error]:', err.message);
  }
};

/**
 * GET All corporate batch uploads (Paginated & Filtered)
 */
const getAllBatches = async (req, res) => {
  try {
    const { status, companyId, page = 1, limit = 15 } = req.query;

    const filter = {};
    if (status) {
      filter.status = status;
    }
    if (companyId) {
      filter.companyId = companyId;
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skipNum = (pageNum - 1) * limitNum;

    const batches = await B2BBatch.find(filter)
      .populate('companyId', 'companyName email phone logoUrl')
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
    console.error('[Admin Get Batches Error]:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve bulk uploads' });
  }
};

/**
 * GET Inspect Specific Batch
 */
const getBatchDetails = async (req, res) => {
  try {
    const batch = await B2BBatch.findById(req.params.batchId)
      .populate('companyId', 'companyName email phone logoUrl authorizedPerson branches');

    if (!batch) {
      return res.status(404).json({ success: false, message: 'Batch not found' });
    }

    const errorsCount = await B2BBatchErrors.countDocuments({ batchId: batch._id });
    const createdJobsCount = await B2BJob.countDocuments({ batchId: batch._id });

    return res.status(200).json({
      success: true,
      batch,
      metrics: {
        errorsCount,
        createdJobsCount
      }
    });
  } catch (error) {
    console.error('[Admin Batch Details Error]:', error);
    res.status(500).json({ success: false, message: 'Failed to inspect batch details' });
  }
};

/**
 * POST Admin Batch Action control (pause, resume, cancel, retry, approve, reject)
 */
const executeAction = async (req, res) => {
  try {
    const { batchId } = req.params;
    const { action, remark } = req.body;

    const batch = await B2BBatch.findById(batchId);
    if (!batch) {
      return res.status(404).json({ success: false, message: 'Batch upload record not found' });
    }

    const companyId = batch.companyId.toString();

    // Log admin intervention in AuditLog
    const auditChanges = { action, previousStatus: batch.status, adminRemark: remark || 'N/A' };

    switch (action) {
      case 'pause':
        if (batch.status !== 'processing') {
          return res.status(400).json({ success: false, message: `Cannot pause batch in status '${batch.status}'` });
        }
        batch.status = 'paused';
        batch.pausedAt = new Date();
        break;

      case 'resume':
        if (batch.status !== 'paused') {
          return res.status(400).json({ success: false, message: `Cannot resume batch in status '${batch.status}' (expected 'paused')` });
        }
        batch.status = 'processing';
        batch.resumedAt = new Date();
        // Re-enqueue creation worker
        await bulkJobQueue.add('createJobs', { batchId: batch._id.toString() });
        break;

      case 'cancel':
        if (['completed', 'failed', 'cancelled'].includes(batch.status)) {
          return res.status(400).json({ success: false, message: 'Cannot cancel a finalized batch' });
        }
        batch.status = 'cancelled';
        batch.failedAt = new Date();
        batch.failureReason = remark || 'Cancelled by WBI Administrator';
        break;

      case 'retry':
        if (!['failed', 'paused', 'cancelled'].includes(batch.status)) {
          return res.status(400).json({ success: false, message: `Cannot retry batch processing in active state '${batch.status}'` });
        }
        batch.status = 'validating';
        batch.failedAt = null;
        batch.failureReason = null;
        // Re-enqueue validation
        await bulkJobQueue.add('validateBatch', { batchId: batch._id.toString() });
        break;

      case 'approve':
        // Overrides and forces completed status
        if (batch.status !== 'validated') {
          return res.status(400).json({ success: false, message: 'Batch must be validated to approve' });
        }
        batch.status = 'processing';
        await bulkJobQueue.add('createJobs', { batchId: batch._id.toString() });
        break;

      case 'reject':
        if (['processing', 'completed'].includes(batch.status)) {
          return res.status(400).json({ success: false, message: 'Cannot reject an already dispatched batch' });
        }
        batch.status = 'failed';
        batch.failedAt = new Date();
        batch.failureReason = remark || 'Rejected by Administrator';
        break;

      default:
        return res.status(400).json({ success: false, message: `Unknown admin control action: ${action}` });
    }

    await batch.save();

    await AuditLog.create({
      actionType: 'BANK_DETAILS_UPDATE', // Reusing matching enum constraints
      actorId: req.user.id,
      actorRole: 'admin',
      targetId: batch._id,
      targetType: 'B2BBatch',
      changes: auditChanges,
      status: 'success'
    });

    // Notify client room
    emitSocket(`b2b:${companyId}`, 'b2b:batchActionExecuted', {
      batchId: batch._id,
      action,
      status: batch.status,
      message: remark || `Batch action ${action} executed by Admin`
    });

    emitSocket(`batch:${batch._id.toString()}`, 'b2b:batchActionExecuted', {
      batchId: batch._id,
      action,
      status: batch.status,
      message: remark || `Batch action ${action} executed by Admin`
    });

    // Notify other admins
    emitSocket('admin', 'admin:batchActionUpdated', {
      batchId: batch._id,
      action,
      status: batch.status
    });

    return res.status(200).json({
      success: true,
      message: `Batch action '${action}' successfully executed`,
      batchStatus: batch.status
    });
  } catch (error) {
    console.error('[Admin Batch Action Error]:', error);
    res.status(500).json({ success: false, message: 'Server error processing batch override command' });
  }
};

module.exports = {
  getAllBatches,
  getBatchDetails,
  executeAction
};
