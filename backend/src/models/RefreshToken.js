// ═══════════════════════════════════════════════════════════════
// REFRESH TOKEN MODEL
// ═══════════════════════════════════════════════════════════════

const mongoose = require('mongoose');

const refreshTokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  token: {
    type: String,
    required: true,
    unique: true // Hashed token
  },
  deviceInfo: {
    userAgent: String,
    ip: String,
    location: String,
    browser: String,
    os: String
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true
  },
  lastUsed: {
    type: Date,
    default: Date.now
  },
  isRevoked: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Auto-delete expired tokens
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Index for efficient queries
refreshTokenSchema.index({ userId: 1, createdAt: -1 });

// Method to check if token is valid
refreshTokenSchema.methods.isValid = function() {
  return !this.isRevoked && this.expiresAt > new Date();
};

module.exports = mongoose.model('RefreshToken', refreshTokenSchema);
