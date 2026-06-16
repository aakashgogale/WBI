const EscrowLedger = require('../models/EscrowLedger');
const PayoutRule = require('../models/PayoutRule');
const payoutService = require('../services/payout.service');

exports.getEscrowLedger = async (req, res) => {
  try {
    const escrow = await EscrowLedger.find().populate('paymentId').sort({ createdAt: -1 });
    res.json({ success: true, data: escrow });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.releaseEscrow = async (req, res) => {
  try {
    const { id } = req.params; // Escrow Ledger ID or Payment ID
    const adminId = req.user._id;

    // Use payout service logic
    const result = await payoutService.releasePayout(id, adminId);
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createPayoutRule = async (req, res) => {
  try {
    const rule = new PayoutRule(req.body);
    await rule.save();
    res.json({ success: true, data: rule, message: 'Payout rule created' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getPayoutRules = async (req, res) => {
  try {
    const rules = await PayoutRule.find();
    res.json({ success: true, data: rules });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
