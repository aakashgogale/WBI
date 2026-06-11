const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const { isUser, isVendor, isWorker, isAdmin, isEngineer } = require('../middleware/roleMiddleware');
const {
  getUserNotifications,
  getVendorNotifications,
  getWorkerNotifications,
  getAdminNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications
} = require('../controllers/notificationControllers/notificationController');

// Routes
router.get('/user', authenticate, isUser, getUserNotifications);
router.get('/vendor', authenticate, isVendor, getVendorNotifications);
router.get('/worker', authenticate, isWorker, getWorkerNotifications);
router.get('/engineer', authenticate, isEngineer, getWorkerNotifications);
router.get('/admin', authenticate, isAdmin, getAdminNotifications);
router.put('/:id/read', authenticate, markAsRead);
router.put('/read-all', authenticate, markAllAsRead);
router.delete('/delete-all', authenticate, deleteAllNotifications);
router.delete('/:id', authenticate, deleteNotification);

module.exports = router;

