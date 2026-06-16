const PayoutRule = require('../models/PayoutRule');
const EscrowLedger = require('../models/EscrowLedger');
const Wallet = require('../models/Wallet');
const WalletTransaction = require('../models/WalletTransaction');
const PaymentApproval = require('../models/PaymentApproval');
const PaymentLog = require('../models/PaymentLog');
const socketService = require('./socket.service');
const mongoose = require('mongoose');

class PayoutService {

  // Calculate the payout amounts based on the active rule
  async calculatePayout({ serviceCategoryId, subServiceId, paymentType, amount }) {
    // Find active payout rule
    let rule = await PayoutRule.findOne({
      serviceCategoryId,
      subServiceId,
      paymentType,
      isActive: true
    });

    if (!rule) {
      // Fallback to category level rule if sub-service rule doesn't exist
      rule = await PayoutRule.findOne({
        serviceCategoryId,
        paymentType,
        isActive: true
      });
    }

    if (!rule) {
      throw new Error('No active payout rule found for this service category and payment type');
    }

    let platformCommission = 0;
    if (rule.platformCommissionType === 'percentage') {
      platformCommission = (amount * rule.platformCommissionValue) / 100;
    } else {
      platformCommission = rule.platformCommissionValue;
    }

    const remainingAfterCommission = amount - platformCommission;

    let engineerShare = 0;
    if (rule.engineerShareType === 'percentage') {
      engineerShare = (amount * rule.engineerShareValue) / 100;
    } else {
      engineerShare = rule.engineerShareValue;
    }

    let workerShare = 0;
    if (rule.workerShareType === 'percentage') {
      workerShare = (amount * rule.workerShareValue) / 100;
    } else {
      workerShare = rule.workerShareValue;
    }

    let vendorShare = 0;
    if (rule.vendorShareType === 'remainder') {
      vendorShare = remainingAfterCommission - engineerShare - workerShare;
    } else if (rule.vendorShareType === 'percentage') {
      vendorShare = (amount * rule.vendorShareValue) / 100;
    } else {
      vendorShare = rule.vendorShareValue;
    }

    return {
      platformCommission,
      vendorShare,
      engineerShare,
      workerShare,
      gstEnabled: rule.gstEnabled,
      tdsEnabled: rule.tdsEnabled
    };
  }

  async releasePayout(paymentId, adminUserId) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const escrow = await EscrowLedger.findOne({ paymentId }).session(session);
      if (!escrow) throw new Error('Escrow record not found');
      if (escrow.status === 'released') throw new Error('Payment already released');

      const approval = await PaymentApproval.findOne({ paymentId }).session(session);
      // Depending on workflow, check if adminApproved, etc.
      // Assuming this is called when Admin hits the Release button.
      
      const payment = await mongoose.model('Payment').findById(paymentId).session(session);
      if (!payment) throw new Error('Payment not found');

      const splits = await this.calculatePayout({
        serviceCategoryId: payment.serviceCategoryId,
        subServiceId: payment.subServiceId,
        paymentType: payment.paymentType,
        amount: escrow.heldAmount
      });

      // Release logic: Update Escrow
      escrow.status = 'released';
      escrow.releasedAmount = escrow.heldAmount;
      escrow.heldAmount = 0;
      await escrow.save({ session });

      payment.escrowStatus = 'released';
      await payment.save({ session });

      // Create Wallet Transactions and Update Wallets
      const createWalletCredit = async (ownerId, ownerType, amount, description) => {
        if (!ownerId || amount <= 0) return;
        
        let wallet = await Wallet.findOne({ ownerId, ownerType }).session(session);
        if (!wallet) {
          wallet = new Wallet({ ownerId, ownerType, availableBalance: 0, totalEarned: 0 });
        }
        
        wallet.availableBalance += amount;
        wallet.totalEarned += amount;
        await wallet.save({ session });

        const tx = new WalletTransaction({
          walletId: wallet._id,
          ownerId,
          ownerType,
          transactionType: 'credit',
          amount,
          status: 'completed',
          sourceType: escrow.sourceType,
          sourceId: escrow.sourceId,
          paymentId: payment._id,
          description,
          idempotencyKey: `credit_${payment._id}_${ownerId}`
        });
        await tx.save({ session });

        socketService.emitToRoom(`${ownerType}:${ownerId}`, 'wallet:credited', {
          amount,
          description,
          paymentId: payment._id
        });
      };

      await createWalletCredit(payment.vendorId, 'vendor', splits.vendorShare, `Payout for ${payment.paymentType}`);
      await createWalletCredit(payment.engineerId, 'engineer', splits.engineerShare, `Payout for ${payment.paymentType}`);
      await createWalletCredit(payment.workerId, 'worker', splits.workerShare, `Payout for ${payment.paymentType}`);

      const log = new PaymentLog({
        paymentId: payment._id,
        action: 'escrow_released',
        performedBy: adminUserId,
        performedByRole: 'admin',
        oldStatus: 'held',
        newStatus: 'released',
        remarks: 'Admin released payout to wallets'
      });
      await log.save({ session });

      await session.commitTransaction();

      socketService.emitToRoom(`payment:${payment._id}`, 'payment:released', { paymentId: payment._id });
      socketService.emitToRoom('admin', 'payment:released', { paymentId: payment._id });

      return { success: true, message: 'Payout released successfully' };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

}

module.exports = new PayoutService();
