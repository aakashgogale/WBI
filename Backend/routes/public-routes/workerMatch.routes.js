const express = require('express');
const router = express.Router();
const workerSearchController = require('../../controllers/publicControllers/workerSearchController');

router.get('/match', workerSearchController.getMatchingWorkers);

module.exports = router;
