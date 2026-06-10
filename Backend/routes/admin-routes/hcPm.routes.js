const express = require('express');
const router = express.Router();
const hcPmController = require('../../controllers/hcPm.controller');
const { authenticate } = require('../../middleware/authMiddleware');
const { isAdmin } = require('../../middleware/roleMiddleware');

router.use(authenticate, isAdmin);

router.route('/')
  .get(hcPmController.getAllEnquiries);

router.route('/:id')
  .get(hcPmController.getEnquiryById)
  .delete(hcPmController.deleteEnquiry);

router.route('/:id/status')
  .put(hcPmController.updateEnquiryStatus);

module.exports = router;
