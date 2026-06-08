const express = require('express');
const router = express.Router();
const installationEnquiryController = require('../../controllers/installationEnquiry.controller');

router.get('/', installationEnquiryController.getAllEnquiries);
router.get('/:id', installationEnquiryController.getEnquiryById);
router.put('/:id/status', installationEnquiryController.updateEnquiryStatus);
router.delete('/:id', installationEnquiryController.deleteEnquiry);

module.exports = router;
