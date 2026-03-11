const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [12, 'Password must be at least 12 characters'],
    select: false, // Don't return password by default
    validate: {
      validator: function(password) {
        // Require: 1 uppercase, 1 lowercase, 1 number, 1 special character
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumber = /\d/.test(password);
        const hasSpecialChar = /[@$!%*?&]/.test(password);
        
        return hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;
      },
      message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)'
    }
  },
  avatar: {
    type: String,
    default: 'https://via.placeholder.com/400'
  },
  images: [{
    type: String,
    validate: {
      validator: function(v) {
        return /^https?:\/\/.+/.test(v);
      },
      message: 'Each image must be a valid URL'
    }
  }],
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters'],
    default: ''
  },
  city: {
    type: String,
    required: [true, 'City is required']
  },
  languages: [{
    type: String,
    required: true
  }],
  age: {
    type: Number,
    min: [18, 'Must be at least 18 years old'],
    max: [120, 'Invalid age']
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Non-binary', 'Prefer not to say', 'Other'],
    default: 'Prefer not to say'
  },
  interests: [{
    type: String,
    maxlength: [50, 'Each interest cannot exceed 50 characters']
  }],
  lookingFor: [{
    type: String,
    enum: ['Friends', 'Study Partners', 'Events', 'Networking', 'Language Exchange', 'Sports Partners'],
  }],
  // Age Verification (GDPR Youth Protection)
  // Age Verification (GDPR Youth Protection)
  ageVerified: {
    type: Boolean,
    default: false,
    required: true
  },
  ageVerifiedDate: Date,
  ageVerificationMethod: {
    type: String,
    enum: ['checkbox', 'id-upload', 'third-party'],
    default: 'checkbox'
  },
  // Email Verification
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  emailVerifiedAt: Date,
  // Password Reset
  passwordResetToken: String,
  passwordResetExpires: Date,
  // Legal Consent Tracking
  acceptedTermsVersion: String,
  acceptedTermsDate: Date,
  acceptedPrivacyVersion: String,
  acceptedPrivacyDate: Date,
  likedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  // GDPR Compliance Fields
  gdprConsent: {
    necessary: {
      type: Boolean,
      default: false // ✅ FIXED: No longer defaults to true - must be explicit
    },
    analytics: {
      type: Boolean,
      default: false
    },
    marketing: {
      type: Boolean,
      default: false
    },
    consentDate: {
      type: Date
    },
    ipAddress: {
      type: String
    },
    lastUpdated: {
      type: Date
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for hosted events
userSchema.virtual('hostedEvents', {
  ref: 'Event',
  localField: '_id',
  foreignField: 'host'
});

// Virtual for likes count
userSchema.virtual('likesCount').get(function() {
  return this.likedBy ? this.likedBy.length : 0;
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove sensitive data from JSON response
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.__v;
  return user;
};

module.exports = mongoose.model('User', userSchema);
