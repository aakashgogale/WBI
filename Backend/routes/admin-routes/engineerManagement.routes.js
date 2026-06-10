const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { authenticate } = require('../../middleware/authMiddleware');
const { isAdmin } = require('../../middleware/roleMiddleware');
const {
  getAllEngineers,
  getEngineerDetails,
  approveEngineer,
  rejectEngineer,
  suspendEngineer,
  getEngineerJobs,
  getEngineerEarnings,
  payEngineer,
  getAllEngineerJobs,
  getEngineerPaymentsSummary,
  toggleEngineerStatus,
  deleteEngineer
} = require('../../controllers/adminControllers/adminEngineerController');

// Validation rules
const rejectEngineerValidation = [
  body('reason').optional().trim()
];

const payEngineerValidation = [
  body('amount').isNumeric().withMessage('Amount must be a number'),
  body('reference').optional().trim(),
  body('notes').optional().trim()
];

// Routes
router.get('/engineers', authenticate, isAdmin, getAllEngineers);
router.get('/engineers/jobs', authenticate, isAdmin, getAllEngineerJobs);
router.get('/engineers/payments', authenticate, isAdmin, getEngineerPaymentsSummary);
router.get('/engineers/:id', authenticate, isAdmin, getEngineerDetails);
router.post('/engineers/:id/approve', authenticate, isAdmin, approveEngineer);
router.post('/engineers/:id/reject', authenticate, isAdmin, rejectEngineerValidation, rejectEngineer);
router.post('/engineers/:id/suspend', authenticate, isAdmin, suspendEngineer);
router.post('/engineers/:id/pay', authenticate, isAdmin, payEngineerValidation, payEngineer);
router.patch('/engineers/:id/status', authenticate, isAdmin, toggleEngineerStatus); // New
router.delete('/engineers/:id', authenticate, isAdmin, deleteEngineer); // New
router.get('/engineers/:id/jobs', authenticate, isAdmin, getEngineerJobs);
router.get('/engineers/:id/earnings', authenticate, isAdmin, getEngineerEarnings);

module.exports = router;
