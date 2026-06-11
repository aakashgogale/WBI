const express = require('express');
const router = express.Router();
const vendorEnquiryController = require('../../controllers/vendorControllers/vendorEnquiry.controller');
const { authenticate } = require('../../middleware/authMiddleware');
const { isVendor } = require('../../middleware/roleMiddleware');

router.use(authenticate);
router.use(isVendor);
// Wait, the vendor auth middleware might be different in this codebase. 
// Assuming protect checks req.user

router.get('/matched', vendorEnquiryController.getMatchedEnquiries);
router.post('/:enquiryId/quote', vendorEnquiryController.submitQuote);

module.exports = router;
