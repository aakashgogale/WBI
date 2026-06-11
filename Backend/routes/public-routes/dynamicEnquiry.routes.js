const express = require('express');
const router = express.Router();
const dynamicEnquiryController = require('../../controllers/publicControllers/dynamicEnquiry.controller');
const { authenticate } = require('../../middleware/authMiddleware');
const { isUser } = require('../../middleware/roleMiddleware');

// Public route to get form configuration
router.get('/form-config/:subServiceId', dynamicEnquiryController.getFormConfig);

// Protected route for clients to submit an enquiry
router.post('/submit', authenticate, isUser, dynamicEnquiryController.submitEnquiry);

// Protected route for clients to accept a quote
router.post('/:enquiryId/quotes/:quoteId/accept', authenticate, isUser, dynamicEnquiryController.acceptQuote);

module.exports = router;
