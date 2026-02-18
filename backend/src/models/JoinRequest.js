const mongoose = require('mongoose');

const joinRequestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  message: {
    type: String,
    maxlength: [200, 'Message cannot exceed 200 characters']
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  respondedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate requests
joinRequestSchema.index({ user: 1, event: 1 }, { unique: true });
joinRequestSchema.index({ event: 1, status: 1 });
joinRequestSchema.index({ user: 1, status: 1 });

// Update respondedAt when status changes
joinRequestSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status !== 'pending') {
    this.respondedAt = new Date();
  }
  next();
});

module.exports = mongoose.model('JoinRequest', joinRequestSchema);
