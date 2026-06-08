const express = require('express');
const router = express.Router();
const maintenanceEnquiryController = require('../../controllers/maintenanceEnquiry.controller');

router.get('/', maintenanceEnquiryController.getAllEnquiries);
router.get('/:id', maintenanceEnquiryController.getEnquiryById);
router.put('/:id/status', maintenanceEnquiryController.updateEnquiryStatus);
router.delete('/:id', maintenanceEnquiryController.deleteEnquiry);

module.exports = router;
