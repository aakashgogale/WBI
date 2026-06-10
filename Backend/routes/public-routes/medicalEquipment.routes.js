const express = require('express');
const router = express.Router();
const medicalEquipmentController = require('../../controllers/medicalEquipment.controller');

router.post('/', medicalEquipmentController.createEnquiry);

module.exports = router;
