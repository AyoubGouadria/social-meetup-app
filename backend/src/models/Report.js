const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  reporterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  targetType: {
    type: String,
    enum: ['user', 'event', 'message'],
    required: true
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'targetModel',
    index: true
  },
  targetModel: {
    type: String,
    enum: ['User', 'Event', 'Message'],
    required: true
  },
  reason: {
    type: String,
    enum: [
      'harassment',
      'hate_speech',
      'violence',
      'spam',
      'inappropriate_content',
      'fake_profile',
      'scam',
      'illegal_activity',
      'safety_concern',
      'other'
    ],
    required: true
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000,
    minlength: 10
  },
  screenshots: [{
    type: String, // Cloudinary URLs
    validate: {
      validator: function(v) {
        return !v || v.startsWith('http://') || v.startsWith('https://');
      },
      message: 'Screenshot must be a valid URL'
    }
  }],
  status: {
    type: String,
    enum: ['pending', 'reviewing', 'resolved', 'dismissed'],
    default: 'pending',
    index: true
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewNotes: {
    type: String,
    maxlength: 1000
  },
  reviewedAt: Date,
  actionTaken: {
    type: String,
    enum: ['none', 'warning_sent', 'content_removed', 'account_suspended', 'account_banned', 'forwarded_to_authorities']
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  }
}, { 
  timestamps: true 
});

// Indexes for efficient queries
reportSchema.index({ reporterId: 1, createdAt: -1 });
reportSchema.index({ status: 1, priority: -1, createdAt: -1 });
reportSchema.index({ targetType: 1, targetId: 1 });

// Prevent duplicate reports within 24 hours
reportSchema.index({ 
  reporterId: 1, 
  targetType: 1, 
  targetId: 1, 
  createdAt: 1 
});

module.exports = mongoose.model('Report', reportSchema);
