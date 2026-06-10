const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/authMiddleware');
const { isEngineer } = require('../../middleware/roleMiddleware');
const {
  getWallet,
  getTransactions,
  requestPayout,
  getWalletSummary,
  requestWithdrawal
} = require('../../controllers/engineerControllers/engineerWalletController');

// Get wallet balance
router.get('/', authenticate, isEngineer, getWallet);

// Get wallet summary
router.get('/summary', authenticate, isEngineer, getWalletSummary);

// Get transaction history
router.get('/transactions', authenticate, isEngineer, getTransactions);

// Request payout from vendor
router.post('/request-payout', authenticate, isEngineer, requestPayout);

// Request withdrawal
router.post('/withdraw', authenticate, isEngineer, requestWithdrawal);

module.exports = router;
