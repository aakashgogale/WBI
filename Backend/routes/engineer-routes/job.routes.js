const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { authenticate } = require('../../middleware/authMiddleware');
const { isEngineer } = require('../../middleware/roleMiddleware');
const {
  getAssignedJobs,
  getJobById,
  updateJobStatus,
  startJob,
  completeJob,
  addWorkerNotes,
  verifyVisit,
  workerReachedLocation,
  collectCash,
  respondToJob,
  uploadJobMedia,
  addJobMaterials,
  getJobTimeline,
  getJobProgress,
  addJobExpenses,
  getJobReport,
  getJobCompletionDetails,
  shareJobReport
} = require('../../controllers/bookingControllers/workerBookingController');
const {
  createOrUpdateBill,
  getBillByBookingId
} = require('../../controllers/vendorControllers/vendorBillController');
const VendorServiceCatalog = require('../../models/VendorServiceCatalog');
const VendorPartsCatalog = require('../../models/VendorPartsCatalog');

// Validation rules
const updateStatusValidation = [
  body('status').isIn(['in_progress', 'completed'])
    .withMessage('Invalid status')
];

const respondValidation = [
  body('status').isIn(['ACCEPTED', 'REJECTED']).withMessage('Invalid status')
];

const addNotesValidation = [
  body('notes').trim().notEmpty().withMessage('Notes are required')
];

// Routes
router.get('/jobs', authenticate, isEngineer, getAssignedJobs);
router.get('/jobs/:id', authenticate, isEngineer, getJobById);
router.put('/jobs/:id/respond', authenticate, isEngineer, respondValidation, respondToJob);
router.put('/jobs/:id/status', authenticate, isEngineer, updateStatusValidation, updateJobStatus);
router.post('/jobs/:id/start', authenticate, isEngineer, startJob);
router.post('/jobs/:id/reached', authenticate, isEngineer, workerReachedLocation);
router.post('/jobs/:id/visit/verify', authenticate, isEngineer, verifyVisit);
router.post('/jobs/:id/complete', authenticate, isEngineer, completeJob);
router.post('/jobs/:id/payment/collect', authenticate, isEngineer, collectCash);
router.post('/jobs/:id/notes', authenticate, isEngineer, addNotesValidation, addWorkerNotes);
router.post('/jobs/:id/upload', authenticate, isEngineer, uploadJobMedia);
router.post('/jobs/:id/materials', authenticate, isEngineer, addJobMaterials);
router.get('/jobs/:id/timeline', authenticate, isEngineer, getJobTimeline);
router.get('/jobs/:id/progress', authenticate, isEngineer, getJobProgress);
router.post('/jobs/:id/expenses', authenticate, isEngineer, addJobExpenses);
router.get('/jobs/:id/report', authenticate, isEngineer, getJobReport);
router.get('/jobs/:id/completion', authenticate, isEngineer, getJobCompletionDetails);
router.post('/jobs/:id/share', authenticate, isEngineer, shareJobReport);

// Bill Routes
router.post('/jobs/:id/bill', authenticate, isEngineer, (req, res, next) => {
  req.params.bookingId = req.params.id;
  next();
}, createOrUpdateBill);

router.get('/jobs/:id/bill', authenticate, isEngineer, (req, res, next) => {
  req.params.bookingId = req.params.id;
  next();
}, getBillByBookingId);

// Catalog Routes (for billing)
router.get('/catalog/services', authenticate, isEngineer, async (req, res) => {
  try {
    const services = await VendorServiceCatalog.find({ status: 'active' }).populate('categoryId', 'title').sort({ name: 1 });
    res.status(200).json({ success: true, services });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch services catalog' });
  }
});

router.get('/catalog/parts', authenticate, isEngineer, async (req, res) => {
  try {
    const parts = await VendorPartsCatalog.find({ status: 'active' })
      .populate('categoryId', 'title')
      .sort({ name: 1 });
    res.status(200).json({ success: true, parts });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch parts catalog' });
  }
});

module.exports = router;

