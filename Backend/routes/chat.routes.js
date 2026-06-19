const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const { getChatHistory, sendMessage } = require('../controllers/chatController');

router.get('/:bookingId', authenticate, getChatHistory);
router.post('/', authenticate, sendMessage);

module.exports = router;
