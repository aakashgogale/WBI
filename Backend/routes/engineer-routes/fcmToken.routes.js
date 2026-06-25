/**
 * Engineer FCM Token Routes
 * Manages FCM tokens for push notifications
 */

const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/authMiddleware');
const { sendPushNotification } = require('../../services/firebaseAdmin');
const Engineer = require('../../models/Engineer');
const User = require('../../models/User');
const Vendor = require('../../models/Vendor');

const MAX_TOKENS = 10; // Maximum tokens per platform

/**
 * @route   POST /api/engineers/fcm-tokens/save
 * @desc    Save FCM token for engineer
 * @access  Private (Engineer)
 */
router.post('/save', authenticate, async (req, res) => {
  try {
    const { token, platform = 'web' } = req.body;
    const engineerId = req.userId || req.user._id;

    if (!token) {
      return res.status(400).json({ success: false, error: 'Token is required' });
    }

    // 1. Remove token if it exists (to avoid duplicates)
    const pullQuery = platform === 'mobile'
      ? { $pull: { fcmTokenMobile: token } }
      : { $pull: { fcmTokens: token } };

    await Engineer.findByIdAndUpdate(engineerId, pullQuery);

    // 2. Add token to front with limit
    const pushQuery = platform === 'mobile'
      ? {
        $push: {
          fcmTokenMobile: {
            $each: [token],
            $position: 0,
            $slice: MAX_TOKENS
          }
        }
      }
      : {
        $push: {
          fcmTokens: {
            $each: [token],
            $position: 0,
            $slice: MAX_TOKENS
          }
        }
      };

    const engineer = await Engineer.findByIdAndUpdate(engineerId, pushQuery, { new: true });

    if (!engineer) {
      return res.status(404).json({ 
        success: false, 
        error: 'Engineer not found', 
        debug: { engineerId, reqUserId: req.userId, type: typeof engineerId } 
      });
    }

    // Remove this token from User and Vendor collections to prevent cross-account notifications
    // COMMENTED OUT to allow testing on same device
    /*
    try {
      await User.updateMany(
        { $or: [{ fcmTokens: token }, { fcmTokenMobile: token }] },
        { $pull: { fcmTokens: token, fcmTokenMobile: token } }
      );

      await Vendor.updateMany(
        { $or: [{ fcmTokens: token }, { fcmTokenMobile: token }] },
        { $pull: { fcmTokens: token, fcmTokenMobile: token } }
      );
    } catch (cleanupError) {
      console.error('Error removing token from other collections:', cleanupError);
    }
    */

    res.json({ success: true, message: 'FCM token saved successfully', role: 'engineer', platform });
  } catch (error) {
    console.error('Error saving FCM token:', error);
    res.status(500).json({ success: false, error: 'Failed to save FCM token' });
  }
});

/**
 * @route   DELETE /api/engineers/fcm-tokens/remove
 * @desc    Remove FCM token for engineer
 * @access  Private (Engineer)
 */
router.delete('/remove', authenticate, async (req, res) => {
  try {
    const { token, platform = 'web' } = req.body;
    const engineerId = req.user._id;

    if (!token) {
      return res.status(400).json({ success: false, error: 'Token is required' });
    }

    const engineer = await Engineer.findById(engineerId);
    if (!engineer) {
      return res.status(404).json({ success: false, error: 'Engineer not found' });
    }

    // Remove token based on platform
    if (platform === 'web' && engineer.fcmTokens) {
      engineer.fcmTokens = engineer.fcmTokens.filter(t => t !== token);
    } else if (platform === 'mobile' && engineer.fcmTokenMobile) {
      engineer.fcmTokenMobile = engineer.fcmTokenMobile.filter(t => t !== token);
    }

    await engineer.save();

    res.json({ success: true, message: 'FCM token removed successfully' });
  } catch (error) {
    console.error('Error removing FCM token:', error);
    res.status(500).json({ success: false, error: 'Failed to remove FCM token' });
  }
});

/**
 * @route   DELETE /api/engineers/fcm-tokens/remove-all
 * @desc    Remove ALL FCM tokens for a specific platform (called during logout)
 * @access  Private (Engineer)
 */
router.delete('/remove-all', authenticate, async (req, res) => {
  try {
    const engineerId = req.user._id;
    const { platform = 'web' } = req.body;

    // Clear only the specified platform's tokens
    const updateQuery = platform === 'mobile'
      ? { $set: { fcmTokenMobile: [] } }
      : { $set: { fcmTokens: [] } };

    const engineer = await Engineer.findByIdAndUpdate(engineerId, updateQuery, { new: true });

    if (!engineer) {
      return res.status(404).json({ success: false, error: 'Engineer not found' });
    }

    console.log(`[FCM] ✅ All ${platform} tokens removed for engineer: ${engineerId}`);
    res.json({ success: true, message: `All ${platform} FCM tokens removed successfully` });
  } catch (error) {
    console.error('Error removing FCM tokens:', error);
    res.status(500).json({ success: false, error: 'Failed to remove FCM tokens' });
  }
});

/**
 * @route   POST /api/engineers/fcm-tokens/test
 * @desc    Send test notification to engineer (development only)
 * @access  Private (Engineer)
 */
router.post('/test', authenticate, async (req, res) => {
  try {
    const engineerId = req.user._id;
    const engineer = await Engineer.findById(engineerId);

    if (!engineer) {
      return res.status(404).json({ success: false, error: 'Engineer not found' });
    }

    const tokens = [...(engineer.fcmTokens || []), ...(engineer.fcmTokenMobile || [])];
    const uniqueTokens = [...new Set(tokens)];

    if (uniqueTokens.length === 0) {
      return res.json({ success: false, error: 'No FCM tokens found for engineer' });
    }

    const response = await sendPushNotification(uniqueTokens, {
      title: '🔔 Test Notification',
      body: 'This is a test notification for engineer!',
      data: {
        type: 'test',
        link: '/engineer/dashboard'
      }
    });

    res.json({
      success: true,
      message: 'Test notification sent',
      successCount: response.successCount,
      failureCount: response.failureCount
    });
  } catch (error) {
    console.error('Error sending test notification:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
