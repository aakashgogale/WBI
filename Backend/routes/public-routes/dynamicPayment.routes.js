const express = require('express');
const router = express.Router();
const dynamicPaymentController = require('../../controllers/publicControllers/dynamicPayment.controller');
const { authenticate } = require('../../middleware/authMiddleware');
const { isUser } = require('../../middleware/roleMiddleware');

router.post('/verify-payment', authenticate, dynamicPaymentController.verifyInvoicePayment);
router.post('/work-orders/:workOrderId/reviews', authenticate, isUser, dynamicPaymentController.submitReview);

module.exports = router;
