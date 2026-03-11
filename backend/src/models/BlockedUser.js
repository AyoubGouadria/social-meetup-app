const mongoose = require('mongoose');

const blockedUserSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  blockedUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  reason: {
    type: String,
    enum: ['harassment', 'spam', 'inappropriate', 'safety', 'fake_profile', 'other'],
    required: true
  },
  notes: {
    type: String,
    maxlength: 500
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Prevent duplicate blocks - composite unique index
blockedUserSchema.index({ userId: 1, blockedUserId: 1 }, { unique: true });

// Index for checking if user is blocked
blockedUserSchema.index({ blockedUserId: 1, userId: 1 });

module.exports = mongoose.model('BlockedUser', blockedUserSchema);
