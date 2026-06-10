const express = require('express');
const router = express.Router();
const qcTestController = require('../../controllers/qcTest.controller');
const { authenticate } = require('../../middleware/authMiddleware');
const { isAdmin } = require('../../middleware/roleMiddleware');

router.use(authenticate, isAdmin);

router.route('/')
  .get(qcTestController.getAllEnquiries);

router.route('/:id')
  .get(qcTestController.getEnquiryById)
  .delete(qcTestController.deleteEnquiry);

router.route('/:id/status')
  .put(qcTestController.updateEnquiryStatus);

module.exports = router;
