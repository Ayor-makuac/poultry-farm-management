const express = require('express');
const router = express.Router();
const {
  createNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification
} = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

// All routes are protected
router.use(protect);

// User-specific routes
router.get('/user/:userId', getUserNotifications);
router.put('/user/:userId/read-all', markAllAsRead);

// Create notification (Admin/Manager only)
router.post('/', authorize('Admin', 'Manager'), createNotification);

// Mark as read and delete
router.put('/:id/read', markAsRead);
router.delete('/:id', deleteNotification);

module.exports = router;

