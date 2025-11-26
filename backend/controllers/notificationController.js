const { Notification, User } = require('../models');

/**
 * @desc    Create notification
 * @route   POST /api/notifications
 * @access  Private/Admin/Manager
 */
const createNotification = async (req, res) => {
  try {
    const { user_id, message, type } = req.body;

    // Validation
    if (!user_id || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide user_id and message'
      });
    }

    // Check if user exists
    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const notification = await Notification.create({
      user_id,
      message,
      type: type || 'Info',
      is_read: false
    });

    res.status(201).json({
      success: true,
      message: 'Notification created successfully',
      data: notification
    });
  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating notification',
      error: error.message
    });
  }
};

/**
 * @desc    Get notifications for specific user
 * @route   GET /api/notifications/user/:userId
 * @access  Private
 */
const getUserNotifications = async (req, res) => {
  try {
    // Users can only see their own notifications unless they're admin
    if (req.user.user_id !== parseInt(req.params.userId) && req.user.role !== 'Admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view these notifications'
      });
    }

    const notifications = await Notification.findAll({
      where: { user_id: req.params.userId },
      order: [['created_at', 'DESC']],
      limit: 50
    });

    const unreadCount = await Notification.count({
      where: { 
        user_id: req.params.userId,
        is_read: false
      }
    });

    res.status(200).json({
      success: true,
      count: notifications.length,
      unreadCount,
      data: notifications
    });
  } catch (error) {
    console.error('Get user notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching notifications',
      error: error.message
    });
  }
};

/**
 * @desc    Mark notification as read
 * @route   PUT /api/notifications/:id/read
 * @access  Private
 */
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findByPk(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    // Users can only mark their own notifications as read unless they're admin
    if (notification.user_id !== req.user.user_id && req.user.role !== 'Admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this notification'
      });
    }

    await notification.update({ is_read: true });

    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      data: notification
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating notification',
      error: error.message
    });
  }
};

/**
 * @desc    Mark all notifications as read for a user
 * @route   PUT /api/notifications/user/:userId/read-all
 * @access  Private
 */
const markAllAsRead = async (req, res) => {
  try {
    // Users can only mark their own notifications as read unless they're admin
    if (req.user.user_id !== parseInt(req.params.userId) && req.user.role !== 'Admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update these notifications'
      });
    }

    await Notification.update(
      { is_read: true },
      { where: { user_id: req.params.userId, is_read: false } }
    );

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating notifications',
      error: error.message
    });
  }
};

/**
 * @desc    Delete notification
 * @route   DELETE /api/notifications/:id
 * @access  Private
 */
const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findByPk(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    // Users can only delete their own notifications unless they're admin
    if (notification.user_id !== req.user.user_id && req.user.role !== 'Admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this notification'
      });
    }

    await notification.destroy();

    res.status(200).json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting notification',
      error: error.message
    });
  }
};

module.exports = {
  createNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification
};

