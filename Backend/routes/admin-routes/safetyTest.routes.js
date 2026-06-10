const express = require('express');
const router = express.Router();
const safetyTestController = require('../../controllers/safetyTest.controller');
const { authenticate } = require('../../middleware/authMiddleware');
const { isAdmin } = require('../../middleware/roleMiddleware');

router.use(authenticate, isAdmin);

router.route('/')
  .get(safetyTestController.getAllEnquiries);

router.route('/:id')
  .get(safetyTestController.getEnquiryById)
  .delete(safetyTestController.deleteEnquiry);

router.route('/:id/status')
  .put(safetyTestController.updateEnquiryStatus);

module.exports = router;
