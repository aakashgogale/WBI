const Engineer = require('../../models/Engineer');
const Transaction = require('../../models/Transaction');
const Booking = require('../../models/Booking');
const Withdrawal = require('../../models/Withdrawal');

/**
 * Get engineer wallet with ledger balance
 */
const getWallet = async (req, res) => {
  try {
    const engineerId = req.user.id;
    const engineer = await Engineer.findById(engineerId);

    if (!engineer) {
      return res.status(404).json({ success: false, message: 'Engineer not found' });
    }

    // List of bookings pending payment
    const pendingBookings = await Booking.find({
      engineerId: engineerId,
      status: 'completed', // Only completed jobs
      engineerPaymentStatus: 'PENDING'
    })
      .select('bookingNumber serviceName completedAt vendorId finalAmount vendorBillId')
      .sort({ completedAt: -1 });

    // Calculate Dynamic Wallet Balances
    const completedTransactions = await Transaction.find({
      engineerId: engineerId,
      status: 'completed',
      type: { $in: ['engineer_payment', 'commission', 'cash_collected', 'earnings_credit'] }
    });
    
    const totalEarnings = completedTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const approvedWithdrawals = await Withdrawal.find({ engineerId, status: 'approved' });
    const withdrawnAmount = approvedWithdrawals.reduce((sum, w) => sum + w.amount, 0);

    const pendingWithdrawals = await Withdrawal.find({ engineerId, status: 'pending' });
    const pendingWithdrawalAmount = pendingWithdrawals.reduce((sum, w) => sum + w.amount, 0);

    // Save accurate synced data if not perfectly aligned
    engineer.wallet.totalEarnings = totalEarnings;
    engineer.wallet.withdrawnAmount = withdrawnAmount;
    engineer.wallet.pendingBalance = pendingWithdrawalAmount;
    await engineer.save();

    res.status(200).json({
      success: true,
      data: {
        balance: engineer.wallet?.balance || 0,
        availableBalance: engineer.wallet?.balance || 0,
        totalBalance: totalEarnings,
        withdrawnAmount: withdrawnAmount,
        pendingBalance: pendingWithdrawalAmount,
        pendingBookings: pendingBookings
      }
    });

  } catch (error) {
    console.error('Get wallet error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch wallet info' });
  }
};

/**
 * Get engineer transactions
 */
const getTransactions = async (req, res) => {
  try {
    const engineerId = req.user.id;
    const { page = 1, limit = 20, type } = req.query;

    const query = { engineerId };

    // Filter by type if provided
    if (type && type !== 'all') {
      query.type = type;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Transaction.countDocuments(query);

    res.status(200).json({
      success: true,
      data: transactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch transactions' });
  }
};

const { sendPushNotification } = require('../../services/firebaseAdmin');

/**
 * Request payout from vendor for a specific booking
 */
const requestPayout = async (req, res) => {
  try {
    const engineerId = req.user.id;
    const { bookingId } = req.body;
    const engineer = await Engineer.findById(engineerId);

    if (!bookingId) {
      return res.status(400).json({ success: false, message: 'Booking ID is required' });
    }

    const booking = await Booking.findOne({
      _id: bookingId,
      engineerId: engineerId,
      status: 'completed',
      engineerPaymentStatus: 'PENDING'
    }).populate('vendorId'); // Ensure vendor is populated to access tokens

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found or already paid' });
    }

    if (!booking.vendorId) {
      return res.status(400).json({ success: false, message: 'No vendor associated with this booking' });
    }

    const vendor = booking.vendorId;
    const message = `Engineer ${engineer.name} has requested payment for Booking #${booking.bookingNumber}.`;
    const title = '💸 Payout Request';

    // Use createNotification helper for proper notification delivery
    const { createNotification } = require('../notificationControllers/notificationController');
    await createNotification({
      vendorId: vendor._id,
      type: 'payout_requested',
      title: title,
      message: message,
      relatedId: booking._id,
      relatedType: 'booking',
      priority: 'high',
      pushData: {
        type: 'payout_requested',
        bookingId: booking._id.toString(),
        link: `/vendor/booking/${booking._id}`
      }
    });

    res.status(200).json({ success: true, message: 'Payment request sent to vendor' });

  } catch (error) {
    console.error('Request payout error:', error);
    res.status(500).json({ success: false, message: 'Failed to send payout request' });
  }
};

/**
 * Get wallet summary for engineer
 */
const getWalletSummary = async (req, res) => {
  try {
    const engineerId = req.user.id;
    const engineer = await Engineer.findById(engineerId);

    if (!engineer) {
      return res.status(404).json({ success: false, message: 'Engineer not found' });
    }

    // Pending bookings sum
    const pendingBookings = await Booking.find({
      engineerId: engineerId,
      status: 'completed',
      engineerPaymentStatus: 'PENDING'
    });

    // In a real system, you'd calculate exact engineer commission from VendorBill.
    // Here we use finalAmount as a proxy if no explicit commission is set.
    const pendingPayouts = pendingBookings.reduce((sum, b) => sum + (b.finalAmount || 0), 0);

    // Total Monthly Earnings
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthlyTransactions = await Transaction.find({
      engineerId: engineerId,
      status: 'completed',
      type: { $in: ['engineer_payment', 'cash_collected', 'credit', 'commission'] },
      createdAt: { $gte: startOfMonth }
    });

    const totalMonthlyEarnings = monthlyTransactions.reduce((sum, t) => sum + t.amount, 0);

    res.status(200).json({
      success: true,
      data: {
        walletBalance: engineer.wallet?.balance || 0,
        pendingPayouts: pendingPayouts,
        totalMonthlyEarnings: totalMonthlyEarnings,
      }
    });

  } catch (error) {
    console.error('Get wallet summary error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch wallet summary' });
  }
};

/**
 * Request Withdrawal
 */
const requestWithdrawal = async (req, res) => {
  try {
    const engineerId = req.user.id;
    const { amount, bankDetails } = req.body;
    
    const engineer = await Engineer.findById(engineerId);
    if (!engineer) return res.status(404).json({ success: false, message: 'Engineer not found' });

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid withdrawal amount' });
    }

    if (engineer.wallet.balance < amount) {
      return res.status(400).json({ success: false, message: 'Insufficient balance' });
    }

    // Deduct available balance
    engineer.wallet.balance -= amount;
    engineer.wallet.pendingBalance += amount;
    await engineer.save();

    const withdrawal = await Withdrawal.create({
      engineerId,
      amount,
      status: 'pending',
      bankDetails,
      requestDate: new Date()
    });

    const transaction = await Transaction.create({
      engineerId,
      type: 'withdrawal',
      amount: -amount,
      status: 'pending',
      description: 'Withdrawal Request',
      referenceId: withdrawal._id.toString(),
      balanceBefore: engineer.wallet.balance + amount,
      balanceAfter: engineer.wallet.balance
    });

    // Notify admins
    const { createNotification } = require('../notificationControllers/notificationController');
    const Admin = require('../../models/Admin');
    const admins = await Admin.find({ role: { $in: ['Super Admin', 'Finance'] } });
    
    for (const admin of admins) {
      await createNotification({
        userId: admin._id,
        userModel: 'Admin',
        type: 'engineer_withdrawal_request',
        title: '💸 Engineer Withdrawal',
        message: `${engineer.name} requested a withdrawal of ₹${amount}`,
        relatedId: withdrawal._id,
        relatedType: 'withdrawal',
        priority: 'high'
      });
    }

    res.status(200).json({ success: true, message: 'Withdrawal request submitted', data: withdrawal });
  } catch (error) {
    console.error('Request withdrawal error:', error);
    res.status(500).json({ success: false, message: 'Failed to request withdrawal' });
  }
};

module.exports = {
  getWallet,
  getTransactions,
  requestPayout,
  getWalletSummary,
  requestWithdrawal
};
