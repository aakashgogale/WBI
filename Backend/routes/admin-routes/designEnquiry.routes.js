const express = require('express');
const router = express.Router();
const designEnquiryController = require('../../controllers/designEnquiry.controller');

// All routes here should be protected by admin middleware in server.js
router.get('/', designEnquiryController.getAllEnquiries);
router.get('/:id', designEnquiryController.getEnquiryById);
router.put('/:id/status', designEnquiryController.updateEnquiryStatus);
router.delete('/:id', designEnquiryController.deleteEnquiry);

module.exports = router;
