const express = require('express');
const router = express.Router();
const bookingDraftController = require('../../controllers/user-controllers/bookingDraft.controller');
// Middlewares like auth can be added here
// const { protect } = require('../../middleware/authMiddleware');

router.get('/:draftId/review', bookingDraftController.getReviewDraft);
router.patch('/:draftId', bookingDraftController.updateDraft);
router.get('/:draftId/live-check', bookingDraftController.liveCheck);
router.post('/confirm', bookingDraftController.confirmReview);

module.exports = router;
