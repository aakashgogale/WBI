const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/authMiddleware');
const { isAdmin } = require('../../middleware/roleMiddleware');
const {
  getB2BWalletsList,
  getB2BWalletByCompany,
  updateDeductionRule,
  createAdjustment,
  processRefund
} = require('../../controllers/adminControllers/b2bWalletAdminController');

// All endpoints are admin-protected
router.use(authenticate, isAdmin);

router.get('/', getB2BWalletsList);
router.get('/:companyId', getB2BWalletByCompany);
router.patch('/:companyId/deduction-rule', updateDeductionRule);
router.post('/:companyId/adjustment', createAdjustment);
router.post('/:companyId/refund', processRefund);

module.exports = router;
