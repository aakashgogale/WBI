const express = require('express');
const router = express.Router();
const { 
  getAllEnquiries, 
  updateEnquiryStatus, 
  deleteEnquiry 
} = require('../../controllers/webEnquiry.controller');
const { authenticate } = require('../../middleware/authMiddleware');
const { isAdmin } = require('../../middleware/roleMiddleware');

// Protect all routes
router.use(authenticate);
router.use(isAdmin);

// @route   GET /api/admin/web-enquiries
// @desc    Get all web enquiries
// @access  Private/Admin
router.get('/', getAllEnquiries);

// @route   PUT /api/admin/web-enquiries/:id
// @desc    Update enquiry status
// @access  Private/Admin
router.put('/:id', updateEnquiryStatus);

// @route   DELETE /api/admin/web-enquiries/:id
// @desc    Delete an enquiry
// @access  Private/Admin
router.delete('/:id', deleteEnquiry);

module.exports = router;
