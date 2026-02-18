const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  type: {
    type: String,
    required: true,
    enum: [
      'join_request',
      'request_accepted',
      'request_rejected',
      'new_message',
      'event_reminder',
      'event_cancelled',
      'participant_joined',
      'participant_left'
    ]
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event'
  },
  joinRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JoinRequest'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  actionable: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for efficient queries
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ event: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
