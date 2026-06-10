const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/authMiddleware');
const { isWorker } = require('../../middleware/roleMiddleware');
const {
  getWallet,
  getTransactions,
  requestPayout,
  getWalletSummary,
  requestWithdrawal
} = require('../../controllers/workerControllers/workerWalletController');

// Get wallet balance
router.get('/', authenticate, isWorker, getWallet);

// Get wallet summary
router.get('/summary', authenticate, isWorker, getWalletSummary);

// Get transaction history
router.get('/transactions', authenticate, isWorker, getTransactions);

// Request payout from vendor
router.post('/request-payout', authenticate, isWorker, requestPayout);

// Request withdrawal
router.post('/withdraw', authenticate, isWorker, requestWithdrawal);

module.exports = router;
