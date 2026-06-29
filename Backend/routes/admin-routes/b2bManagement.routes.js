const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/authMiddleware');
const { isAdmin } = require('../../middleware/roleMiddleware');
const {
  getAllCompanies,
  approveCompany,
  rejectCompany
} = require('../../controllers/adminControllers/b2bManagementController');

// All routes are protected by authenticate and isAdmin middlewares
router.get('/b2b-companies', authenticate, isAdmin, getAllCompanies);
router.patch('/b2b-companies/:id/approve', authenticate, isAdmin, approveCompany);
router.patch('/b2b-companies/:id/reject', authenticate, isAdmin, rejectCompany);

module.exports = router;
