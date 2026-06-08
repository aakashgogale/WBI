const express = require('express');
const router = express.Router();
const breakdownEnquiryController = require('../../controllers/breakdownEnquiry.controller');

router.get('/', breakdownEnquiryController.getAllEnquiries);
router.get('/:id', breakdownEnquiryController.getEnquiryById);
router.put('/:id/status', breakdownEnquiryController.updateEnquiryStatus);
router.delete('/:id', breakdownEnquiryController.deleteEnquiry);

module.exports = router;
