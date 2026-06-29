const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { authenticate } = require('../../middleware/authMiddleware');
const { isApprovedB2B } = require('../../middleware/roleMiddleware');
const b2bBulkJobController = require('../../controllers/b2bControllers/b2bBulkJobController');

// Ensure local upload directories exist safely in the workspace
const uploadDir = path.join(__dirname, '../../uploads/b2b-bulk');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage engine config
const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File extensions filter
const excelFilter = (req, file, cb) => {
  const allowedExtensions = ['.xlsx', '.xls', '.csv'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file format. Only .xlsx, .xls, and .csv are supported.'), false);
  }
};

// Spreadsheet upload handler (Max 20MB)
const uploadSpreadsheet = multer({
  storage: diskStorage,
  fileFilter: excelFilter,
  limits: {
    fileSize: 20 * 1024 * 1024
  }
}).single('file');

const handleMulterError = (err, req, res, next) => {
  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message || 'File upload failed'
    });
  }
  next();
};

// Endpoints mapping
router.get('/stats', authenticate, isApprovedB2B, b2bBulkJobController.getStats);
router.get('/sample', authenticate, isApprovedB2B, b2bBulkJobController.downloadSample);
router.post('/upload', authenticate, isApprovedB2B, uploadSpreadsheet, handleMulterError, b2bBulkJobController.uploadFile);
router.get('/history', authenticate, isApprovedB2B, b2bBulkJobController.getHistory);
router.get('/:batchId', authenticate, isApprovedB2B, b2bBulkJobController.getBatchDetails);
router.get('/:batchId/download', authenticate, isApprovedB2B, b2bBulkJobController.downloadOriginalFile);
router.get('/errors/:batchId', authenticate, isApprovedB2B, b2bBulkJobController.getBatchErrors);
router.get('/errors/:batchId/download', authenticate, isApprovedB2B, b2bBulkJobController.downloadErrorReport);
router.post('/confirm/:batchId', authenticate, isApprovedB2B, b2bBulkJobController.confirmUpload);
router.post('/:batchId/retry', authenticate, isApprovedB2B, b2bBulkJobController.retryBatch);
router.delete('/:batchId', authenticate, isApprovedB2B, b2bBulkJobController.deleteBatch);

module.exports = router;
