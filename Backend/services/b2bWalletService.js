const B2BWallet = require('../models/B2BWallet');
const B2BWalletTransaction = require('../models/B2BWalletTransaction');
const B2BDeductionRule = require('../models/B2BDeductionRule');
const B2BInvoice = require('../models/B2BInvoice');
const B2BJob = require('../models/B2BJob');
const B2BCompany = require('../models/B2BCompany');

/**
 * Triggered when a B2B job is marked completed.
 * Calculates job fees and automatically deducts from company wallet.
 */
const deductWalletForCompletedJob = async (companyId, jobId, app = null) => {
  console.log(`[B2B Wallet Service] Triggering auto-deduction for company: ${companyId}, job: ${jobId}`);
  try {
    // 1. Fetch the Job record
    const job = await B2BJob.findById(jobId);
    if (!job) {
      console.error(`[B2B Wallet Service] Job ${jobId} not found`);
      return { success: false, error: 'Job not found' };
    }

    if (job.paymentStatus === 'deducted') {
      console.log(`[B2B Wallet Service] Job ${job.jobId} already deducted`);
      return { success: true, message: 'Already deducted' };
    }

    // 2. Fetch Wallet and active rule
    let wallet = await B2BWallet.findOne({ companyId });
    if (!wallet) {
      wallet = await B2BWallet.create({ companyId, balance: 0 });
    }

    let rule = await B2BDeductionRule.findOne({ companyId, isActive: true });
    if (!rule) {
      rule = await B2BDeductionRule.create({ companyId, perJobCharge: 12, gstPercent: 18, isActive: true });
    }

    // 3. Compute charges
    const perJobCharge = rule.perJobCharge;
    const gstPercent = rule.gstPercent;
    const gstAmount = parseFloat((perJobCharge * (gstPercent / 100)).toFixed(2));
    const totalDeduction = parseFloat((perJobCharge + gstAmount).toFixed(2));

    // Socket.io helpers
    const emitEvent = (eventName, room, data) => {
      if (app) {
        try {
          const io = app.get('socketio');
          if (io) {
            io.to(room).emit(eventName, data);
            console.log(`[Socket.io] Emitted ${eventName} to ${room}`);
          }
        } catch (err) {
          console.warn('[Socket.io] Emit failure:', err.message);
        }
      }
    };

    // 4. Check Wallet Balance
    if (wallet.balance >= totalDeduction) {
      // Deduct balance
      wallet.balance = parseFloat((wallet.balance - totalDeduction).toFixed(2));
      wallet.totalSpent = parseFloat((wallet.totalSpent + totalDeduction).toFixed(2));
      wallet.lastUpdatedAt = new Date();
      await wallet.save();

      // Sync company profile
      await B2BCompany.findByIdAndUpdate(companyId, { walletBalance: wallet.balance });

      // Create transaction log (debit)
      const transactionId = `TXN-DED-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      const txn = await B2BWalletTransaction.create({
        companyId,
        walletId: wallet._id,
        transactionId,
        type: 'job_deduction',
        amount: -perJobCharge,
        gstAmount: -gstAmount,
        totalAmount: -totalDeduction,
        status: 'success',
        paymentMethod: 'wallet',
        remark: `Auto-deduction for completed job ID: ${job.jobId}`,
        relatedJobIds: [jobId]
      });

      // Update Job details
      job.charge = totalDeduction;
      job.paymentStatus = 'deducted';
      job.status = 'completed';
      await job.save();

      // Create Invoice record
      const invoiceNumber = `WBI-DED-${Date.now().toString().substring(5)}`;
      const newInvoice = await B2BInvoice.create({
        companyId,
        invoiceId: `INV-DED-${Date.now()}`,
        invoiceNumber,
        invoiceType: 'deduction',
        amount: perJobCharge,
        gstAmount,
        totalAmount: totalDeduction,
        status: 'Settled',
        fileUrl: `https://wbi-invoices.s3.amazonaws.com/${invoiceNumber}.pdf`
      });

      // Emit success events
      emitEvent('b2b:walletUpdated', `b2b:${companyId}`, {
        balance: wallet.balance,
        totalSpent: wallet.totalSpent
      });
      emitEvent('b2b:deductionSuccess', `b2b:${companyId}`, {
        jobId: job.jobId,
        amount: totalDeduction
      });
      emitEvent('admin:b2bWalletUpdated', 'admin', {
        companyId,
        balance: wallet.balance
      });

      console.log(`[B2B Wallet Service] Successfully auto-deducted ₹${totalDeduction} for job: ${job.jobId}`);
      return { success: true, txn, wallet };
    } else {
      // Insufficient balance: record pending deductions
      wallet.pendingDeductions = parseFloat((wallet.pendingDeductions + totalDeduction).toFixed(2));
      wallet.lastUpdatedAt = new Date();
      await wallet.save();

      // Update Job details
      job.charge = totalDeduction;
      job.paymentStatus = 'pending_deduction';
      job.status = 'completed';
      await job.save();

      // Emit low balance alerts
      emitEvent('b2b:walletUpdated', `b2b:${companyId}`, {
        balance: wallet.balance,
        pendingDeductions: wallet.pendingDeductions
      });
      emitEvent('b2b:lowBalance', `b2b:${companyId}`, {
        balance: wallet.balance,
        required: totalDeduction,
        message: 'Wallet balance insufficient for completed job deductions. Please top up.'
      });

      console.warn(`[B2B Wallet Service] Insufficient balance (₹${wallet.balance}) for job: ${job.jobId}. Required: ₹${totalDeduction}. Added to pending.`);
      return { success: false, error: 'Insufficient balance', pending: true };
    }
  } catch (error) {
    console.error('[B2B Wallet Service] Auto-deduction error:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  deductWalletForCompletedJob
};
