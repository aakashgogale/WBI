const express = require('express');
const router = express.Router();
const walletController = require('../controllers/wallet.controller');
const { authenticate } = require('../middleware/authMiddleware');

const { verifyBankForWithdrawal } = require('../middleware/verificationMiddleware');

router.get('/summary', authenticate, walletController.getWalletSummary);
router.get('/transactions', authenticate, walletController.getWalletTransactions);
router.post('/withdraw', authenticate, verifyBankForWithdrawal, walletController.requestWithdrawal);
router.get('/withdrawals', authenticate, walletController.getWithdrawals);
router.get('/assigned-services', authenticate, walletController.getAssignedServices);
router.get('/payments', authenticate, walletController.getPayments);
router.get('/bank', authenticate, walletController.getBankDetails);
router.post('/bank', authenticate, walletController.updateBankDetails);

module.exports = router;
