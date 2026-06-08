const express = require('express');
const router = express.Router();
const { 
  getAllEnquiries, 
  updateEnquiryStatus, 
  deleteEnquiry 
} = require('../../controllers/bankingEnquiry.controller');
const { authenticate } = require('../../middleware/authMiddleware');
const { isAdmin } = require('../../middleware/roleMiddleware');

// Protect all routes
router.use(authenticate);
router.use(isAdmin);

// @route   GET /api/admin/banking-enquiries
// @desc    Get all banking enquiries
// @access  Private/Admin
router.get('/', getAllEnquiries);

// @route   PUT /api/admin/banking-enquiries/:id
// @desc    Update banking enquiry status
// @access  Private/Admin
router.put('/:id', updateEnquiryStatus);

// @route   DELETE /api/admin/banking-enquiries/:id
// @desc    Delete a banking enquiry
// @access  Private/Admin
router.delete('/:id', deleteEnquiry);

module.exports = router;
