const { mongoose } = require('../config/database');
const applyVirtualId = require('./plugins/addVirtualId');

const NotificationSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: ['Info', 'Warning', 'Alert', 'Success'],
      default: 'Info'
    },
    is_read: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

applyVirtualId(NotificationSchema, 'notification_id');

module.exports = mongoose.model('Notification', NotificationSchema);

