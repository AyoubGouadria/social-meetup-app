const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: [true, 'Message text is required'],
    trim: true,
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  },
  type: {
    type: String,
    enum: ['user', 'system'],
    default: 'user'
  },
  isRead: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

// Index for efficient queries
messageSchema.index({ event: 1, createdAt: -1 });
messageSchema.index({ user: 1 });

module.exports = mongoose.model('Message', messageSchema);
