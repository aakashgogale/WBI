const express = require('express');
const router = express.Router();
const medicalEquipmentController = require('../../controllers/medicalEquipment.controller');
const { authenticate } = require('../../middleware/authMiddleware');
const { isAdmin } = require('../../middleware/roleMiddleware');

router.use(authenticate, isAdmin);

router.route('/')
  .get(medicalEquipmentController.getAllEnquiries);

router.route('/:id')
  .get(medicalEquipmentController.getEnquiryById)
  .delete(medicalEquipmentController.deleteEnquiry);

router.route('/:id/status')
  .put(medicalEquipmentController.updateEnquiryStatus);

module.exports = router;
