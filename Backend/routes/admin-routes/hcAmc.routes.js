const express = require('express');
const router = express.Router();
const hcAmcController = require('../../controllers/hcAmc.controller');
const { authenticate } = require('../../middleware/authMiddleware');
const { isAdmin } = require('../../middleware/roleMiddleware');

router.use(authenticate, isAdmin);

router.route('/')
  .get(hcAmcController.getAllEnquiries);

router.route('/:id')
  .get(hcAmcController.getEnquiryById)
  .delete(hcAmcController.deleteEnquiry);

router.route('/:id/status')
  .put(hcAmcController.updateEnquiryStatus);

module.exports = router;
