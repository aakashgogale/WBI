const express = require('express');
const router = express.Router();
const { getEnquiries, getEnquiry, updateEnquiryStatus, deleteEnquiry } = require('../../controllers/marketingEnquiry.controller');
const { authenticate } = require('../../middleware/authMiddleware');
const { isAdmin } = require('../../middleware/roleMiddleware');

router.use(authenticate);
router.use(isAdmin);

router.route('/')
  .get(getEnquiries);

router.route('/:id')
  .get(getEnquiry)
  .put(updateEnquiryStatus)
  .delete(deleteEnquiry);

module.exports = router;
