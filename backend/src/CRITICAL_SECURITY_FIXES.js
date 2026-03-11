// ═══════════════════════════════════════════════════════════════
// CRITICAL SECURITY ENHANCEMENTS - IMPLEMENTATION GUIDE
// ═══════════════════════════════════════════════════════════════
// This file contains step-by-step implementation instructions for
// the critical security vulnerabilities identified in the penetration test.
// ═══════════════════════════════════════════════════════════════

/**
 * STEP 1: ADD FIELDS TO USER MODEL
 * File: backend/src/models/User.js
 */

// Add these fields to the userSchema (before the closing brace):
const USER_MODEL_ADDITIONS = `
  // Account Security
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date
  },
  isLocked: {
    type: Boolean,
    default: false
  },
  
  // Email Verification
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: {
    type: String,
    select: false
  },
  emailVerificationExpires: {
    type: Date
  },
  
  // Multi-Factor Authentication
  mfaEnabled: {
    type: Boolean,
    default: false
  },
  mfaSecret: {
    type: String,
    select: false
  },
  mfaBackupCodes: {
    type: [String],
    select: false
  },
  
  // Role-Based Access Control
  role: {
    type: String,
    enum: ['user', 'moderator', 'admin'],
    default: 'user'
  },
  permissions: [{
    type: String,
    enum: ['create_event', 'delete_event', 'moderate_content', 'ban_user', 'manage_users']
  }],
  
  // Account Status
  isBanned: {
    type: Boolean,
    default: false
  },
  bannedUntil: {
    type: Date
  },
  bannedReason: {
    type: String
  },
  
  // Password History (store last 5 password hashes)
  passwordHistory: [{
    hash: String,
    changedAt: { type: Date, default: Date.now }
  }],
  
  // Security Events Log
  securityEvents: [{
    type: {
      type: String,
      enum: ['login', 'logout', 'password_change', 'mfa_enabled', 'mfa_disabled', 'account_locked']
    },
    timestamp: { type: Date, default: Date.now },
    ip: String,
    userAgent: String,
    location: String
  }]
`;

// Add these methods to userSchema.methods:
const USER_MODEL_METHODS = `
// Check if account is locked
userSchema.methods.isAccountLocked = function() {
  return this.lockUntil && this.lockUntil > Date.now();
};

// Increment failed login attempts
userSchema.methods.incLoginAttempts = async function() {
  // Reset attempts if lock has expired
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return await this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1, isLocked: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  const MAX_LOGIN_ATTEMPTS = 5;
  const LOCK_TIME = 2 * 60 * 60 * 1000; // 2 hours
  
  // Lock account after max attempts
  if (this.loginAttempts + 1 >= MAX_LOGIN_ATTEMPTS) {
    updates.$set = { 
      lockUntil: Date.now() + LOCK_TIME,
      isLocked: true
    };
    
    // Log security event
    this.securityEvents.push({
      type: 'account_locked',
      timestamp: new Date(),
      ip: this.lastLoginIp
    });
  }
  
  return await this.updateOne(updates);
};

// Reset login attempts on successful login
userSchema.methods.resetLoginAttempts = async function() {
  if (this.loginAttempts > 0 || this.isLocked) {
    return await this.updateOne({
      $set: { loginAttempts: 0, isLocked: false },
      $unset: { lockUntil: 1 }
    });
  }
};

// Check password against history
userSchema.methods.isPasswordInHistory = async function(password) {
  if (!this.passwordHistory || this.passwordHistory.length === 0) {
    return false;
  }
  
  for (const entry of this.passwordHistory) {
    const isMatch = await bcrypt.compare(password, entry.hash);
    if (isMatch) return true;
  }
  
  return false;
};

// Add password to history (before hashing new one)
userSchema.methods.addPasswordToHistory = async function(currentHashedPassword) {
  if (!this.passwordHistory) {
    this.passwordHistory = [];
  }
  
  this.passwordHistory.push({
    hash: currentHashedPassword,
    changedAt: new Date()
  });
  
  // Keep only last 5 passwords
  if (this.passwordHistory.length > 5) {
    this.passwordHistory.shift();
  }
};

// Log security event
userSchema.methods.logSecurityEvent = function(type, ip, userAgent, location) {
  if (!this.securityEvents) {
    this.securityEvents = [];
  }
  
  this.securityEvents.push({
    type,
    timestamp: new Date(),
    ip,
    userAgent,
    location
  });
  
  // Keep only last 50 events
  if (this.securityEvents.length > 50) {
    this.securityEvents.shift();
  }
};
`;

// Update bcrypt rounds in pre-save hook:
const BCRYPT_UPDATE = `
// Change from:
const salt = await bcrypt.genSalt(10);

// To:
const salt = await bcrypt.genSalt(12); // Increased from 10 to 12
`;

/**
 * STEP 2: UPDATE AUTH CONTROLLER
 * File: backend/src/controllers/authController.js
 */

const AUTH_CONTROLLER_UPDATES = `
const crypto = require('crypto');
const RefreshToken = require('../models/RefreshToken');
const UAParser = require('ua-parser-js'); // npm install ua-parser-js
const geoip = require('geoip-lite'); // npm install geoip-lite

// ═══════════════════════════════════════════════════════════════
// UPDATED LOGIN FUNCTION
// ═══════════════════════════════════════════════════════════════
exports.login = async (req, res, next) => {
  try {
    const { email, password, mfaToken } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Always fetch user with password (prevent timing attack)
    const user = await User.findOne({ email })
      .select('+password +loginAttempts +lockUntil +isLocked +mfaEnabled +mfaSecret');

    // Dummy hash for timing attack prevention
    const dummyHash = '$2a$12$' + 'x'.repeat(53);
    const hashToCompare = user ? user.password : dummyHash;
    
    // Always perform bcrypt comparison (constant time)
    const isMatch = await bcrypt.compare(password, hashToCompare);

    // Check if account is locked
    if (user && user.isAccountLocked()) {
      const remainingTime = Math.ceil((user.lockUntil - Date.now()) / 60000);
      return res.status(423).json({
        success: false,
        message: \`Account is temporarily locked due to multiple failed login attempts. Try again in \${remainingTime} minutes.\`,
        lockedUntil: user.lockUntil
      });
    }

    // Check if credentials are valid
    if (!user || !isMatch) {
      // Increment failed attempts if user exists
      if (user) {
        await user.incLoginAttempts();
      }
      
      // Add random delay to prevent timing analysis
      await new Promise(resolve => 
        setTimeout(resolve, 100 + Math.random() * 200)
      );
      
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if account is banned
    if (user.isBanned) {
      const message = user.bannedUntil && user.bannedUntil > Date.now()
        ? \`Account is temporarily banned until \${user.bannedUntil.toISOString()}. Reason: \${user.bannedReason || 'Terms violation'}\`
        : \`Account is permanently banned. Reason: \${user.bannedReason || 'Terms violation'}\`;
      
      return res.status(403).json({
        success: false,
        message
      });
    }

    // Check if email is verified
    if (!user.emailVerified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email before logging in',
        emailVerificationRequired: true
      });
    }

    // Check MFA if enabled
    if (user.mfaEnabled) {
      if (!mfaToken) {
        return res.status(401).json({
          success: false,
          message: 'Multi-factor authentication code required',
          mfaRequired: true
        });
      }

      const speakeasy = require('speakeasy');
      const verified = speakeasy.totp.verify({
        secret: user.mfaSecret,
        encoding: 'base32',
        token: mfaToken,
        window: 2 // Allow 60 second time difference
      });

      if (!verified) {
        await user.incLoginAttempts();
        return res.status(401).json({
          success: false,
          message: 'Invalid MFA code'
        });
      }
    }

    // Reset login attempts on successful login
    await user.resetLoginAttempts();

    // Parse user agent and get location
    const parser = new UAParser(req.headers['user-agent']);
    const deviceInfo = {
      userAgent: req.headers['user-agent'],
      ip: req.ip || req.connection.remoteAddress,
      browser: parser.getBrowser().name,
      os: parser.getOS().name,
      location: 'Unknown'
    };

    // Get geographic location from IP
    const geo = geoip.lookup(deviceInfo.ip);
    if (geo) {
      deviceInfo.location = \`\${geo.city || 'Unknown'}, \${geo.country}\`;
    }

    // Generate short-lived access token (15 minutes)
    const accessToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { 
        expiresIn: '15m',
        algorithm: 'HS256',
        issuer: 'meetly-api',
        audience: 'meetly-client'
      }
    );

    // Generate refresh token
    const refreshTokenValue = crypto.randomBytes(64).toString('hex');
    const hashedRefreshToken = crypto
      .createHash('sha256')
      .update(refreshTokenValue)
      .digest('hex');

    // Store refresh token in database
    await RefreshToken.create({
      userId: user._id,
      token: hashedRefreshToken,
      deviceInfo,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    });

    // Log security event
    user.logSecurityEvent('login', deviceInfo.ip, deviceInfo.userAgent, deviceInfo.location);
    user.lastActive = new Date();
    await user.save();

    // Set refresh token as HttpOnly cookie
    res.cookie('refreshToken', refreshTokenValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000,
      path: '/'
    });

    // Remove sensitive data
    user.password = undefined;
    user.mfaSecret = undefined;

    // Get event counts
    const hostedEventsCount = await Event.countDocuments({
      host: user._id,
      status: 'published'
    });
    const joinedEventsCount = await Event.countDocuments({
      participants: user._id,
      status: 'published',
      date: { $lt: new Date() }
    });

    const userWithCounts = {
      ...user.toObject(),
      hostedEventsCount,
      joinedEventsCount
    };

    // Return response (NO TOKEN IN BODY for production)
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: userWithCounts,
        accessToken // Only for development - remove in production
      }
    });
  } catch (error) {
    next(error);
  }
};

// ═══════════════════════════════════════════════════════════════
// NEW: REFRESH TOKEN ENDPOINT
// ═══════════════════════════════════════════════════════════════
exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'No refresh token provided'
      });
    }

    // Hash the refresh token
    const hashedToken = crypto
      .createHash('sha256')
      .update(refreshToken)
      .digest('hex');

    // Find refresh token in database
    const storedToken = await RefreshToken.findOne({
      token: hashedToken,
      expiresAt: { $gt: new Date() },
      isRevoked: false
    }).populate('userId');

    if (!storedToken) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token'
      });
    }

    // Check if user still exists and is active
    const user = await User.findById(storedToken.userId);
    if (!user || user.isBanned || !user.emailVerified) {
      await storedToken.updateOne({ isRevoked: true });
      return res.status(401).json({
        success: false,
        message: 'User account is not active'
      });
    }

    // Generate new access token
    const accessToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { 
        expiresIn: '15m',
        algorithm: 'HS256',
        issuer: 'meetly-api',
        audience: 'meetly-client'
      }
    );

    // Update last used timestamp
    storedToken.lastUsed = new Date();
    await storedToken.save();

    res.status(200).json({
      success: true,
      data: {
        accessToken
      }
    });
  } catch (error) {
    next(error);
  }
};

// ═══════════════════════════════════════════════════════════════
// NEW: GET ACTIVE SESSIONS
// ═══════════════════════════════════════════════════════════════
exports.getSessions = async (req, res, next) => {
  try {
    const sessions = await RefreshToken.find({
      userId: req.user._id,
      expiresAt: { $gt: new Date() },
      isRevoked: false
    })
    .sort({ lastUsed: -1 })
    .select('deviceInfo createdAt lastUsed expiresAt');

    res.status(200).json({
      success: true,
      data: {
        sessions,
        currentSession: req.cookies.refreshToken ? 
          crypto.createHash('sha256').update(req.cookies.refreshToken).digest('hex') : null
      }
    });
  } catch (error) {
    next(error);
  }
};

// ═══════════════════════════════════════════════════════════════
// NEW: REVOKE SPECIFIC SESSION
// ═══════════════════════════════════════════════════════════════
exports.revokeSession = async (req, res, next) => {
  try {
    const { sessionId } = req.params;

    const session = await RefreshToken.findOneAndUpdate(
      {
        _id: sessionId,
        userId: req.user._id
      },
      {
        isRevoked: true
      }
    );

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Session revoked successfully'
    });
  } catch (error) {
    next(error);
  }
};

// ═══════════════════════════════════════════════════════════════
// NEW: REVOKE ALL SESSIONS (EXCEPT CURRENT)
// ═══════════════════════════════════════════════════════════════
exports.revokeAllSessions = async (req, res, next) => {
  try {
    const currentToken = req.cookies.refreshToken;
    const currentTokenHash = currentToken ? 
      crypto.createHash('sha256').update(currentToken).digest('hex') : null;

    // Revoke all sessions except current
    const result = await RefreshToken.updateMany(
      {
        userId: req.user._id,
        token: { $ne: currentTokenHash },
        isRevoked: false
      },
      {
        isRevoked: true
      }
    );

    res.status(200).json({
      success: true,
      message: \`\${result.modifiedCount} session(s) revoked successfully\`
    });
  } catch (error) {
    next(error);
  }
};

// ═══════════════════════════════════════════════════════════════
// UPDATED: LOGOUT (REVOKE CURRENT SESSION)
// ═══════════════════════════════════════════════════════════════
exports.logout = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      const hashedToken = crypto
        .createHash('sha256')
        .update(refreshToken)
        .digest('hex');

      // Revoke the refresh token
      await RefreshToken.findOneAndUpdate(
        { token: hashedToken },
        { isRevoked: true }
      );
    }

    // Log security event
    if (req.user) {
      const user = await User.findById(req.user._id);
      user.logSecurityEvent('logout', req.ip, req.headers['user-agent'], 'Unknown');
      await user.save();
    }

    // Clear cookies
    res.cookie('refreshToken', '', {
      httpOnly: true,
      expires: new Date(0),
      path: '/'
    });

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
};

// ═══════════════════════════════════════════════════════════════
// UPDATED: CHANGE PASSWORD
// ═══════════════════════════════════════════════════════════════
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password +passwordHistory');

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Check if new password is in history
    const isInHistory = await user.isPasswordInHistory(newPassword);
    if (isInHistory) {
      return res.status(400).json({
        success: false,
        message: 'Cannot reuse your last 5 passwords'
      });
    }

    // Add current password to history
    await user.addPasswordToHistory(user.password);

    // Set new password
    user.password = newPassword;
    
    // Log security event
    user.logSecurityEvent('password_change', req.ip, req.headers['user-agent'], 'Unknown');
    
    await user.save();

    // Revoke all other sessions (force re-login on all devices)
    await RefreshToken.updateMany(
      { userId: user._id },
      { isRevoked: true }
    );

    res.status(200).json({
      success: true,
      message: 'Password changed successfully. All other sessions have been logged out.'
    });
  } catch (error) {
    next(error);
  }
};
`;

/**
 * STEP 3: UPDATE AUTH MIDDLEWARE
 * File: backend/src/middleware/auth.js
 */

const AUTH_MIDDLEWARE_UPDATES = `
// Update protect middleware to use new JWT verification
const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in cookies (HttpOnly - preferred method)
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }
    // Fallback: Check for token in headers (for API clients)
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    try {
      // Verify token with strict options
      const decoded = jwt.verify(token, process.env.JWT_SECRET, {
        algorithms: ['HS256'],
        issuer: 'meetly-api',
        audience: 'meetly-client'
      });

      // Get user from token
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      // Check if user is banned
      if (req.user.isBanned) {
        return res.status(403).json({
          success: false,
          message: 'Account is banned'
        });
      }

      // Check if email is verified
      if (!req.user.emailVerified) {
        return res.status(403).json({
          success: false,
          message: 'Email verification required'
        });
      }

      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Token is invalid or expired'
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Authentication error',
      error: error.message
    });
  }
};

// NEW: Role-based authorization middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: \`Access denied. Requires role: \${roles.join(' or ')}\`
      });
    }

    next();
  };
};

// NEW: Permission-based authorization
const checkPermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }

    if (req.user.role === 'admin') {
      // Admins have all permissions
      return next();
    }

    if (!req.user.permissions || !req.user.permissions.includes(permission)) {
      return res.status(403).json({
        success: false,
        message: \`Missing required permission: \${permission}\`
      });
    }

    next();
  };
};

module.exports = {
  protect,
  isEventHost,
  optionalAuth,
  authorize,
  checkPermission
};
`;

/**
 * STEP 4: UPDATE ROUTES
 * File: backend/src/routes/auth.js
 */

const AUTH_ROUTES_UPDATES = `
const {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  logout,
  refreshToken,
  getSessions,
  revokeSession,
  revokeAllSessions
} = require('../controllers/authController');

// Public routes
router.post('/register', registerValidation, validate, register);
router.post('/login', loginValidation, validate, login);

// Token management
router.post('/refresh', refreshToken); // Refresh access token
router.post('/logout', protect, logout);

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/password', protect, changePassword);

// Session management
router.get('/sessions', protect, getSessions);
router.delete('/sessions/:sessionId', protect, revokeSession);
router.delete('/sessions', protect, revokeAllSessions);
`;

/**
 * STEP 5: INSTALL REQUIRED PACKAGES
 */

const REQUIRED_PACKAGES = \`
# Install security packages
npm install ua-parser-js geoip-lite speakeasy qrcode

# ua-parser-js: Parse user agent strings
# geoip-lite: IP geolocation
# speakeasy: TOTP for MFA
# qrcode: Generate QR codes for MFA setup
\`;

/**
 * STEP 6: ENVIRONMENT VARIABLES
 * Add to .env file
 */

const ENV_ADDITIONS = \`
# JWT Configuration (updated)
JWT_ACCESS_TOKEN_EXPIRE=15m
JWT_REFRESH_TOKEN_EXPIRE=30d

# Account Security
MAX_LOGIN_ATTEMPTS=5
ACCOUNT_LOCK_TIME=7200000

# Email Configuration (for verification)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=noreply@meetly.com
\`;

// Export for reference
module.exports = {
  USER_MODEL_ADDITIONS,
  USER_MODEL_METHODS,
  BCRYPT_UPDATE,
  AUTH_CONTROLLER_UPDATES,
  AUTH_MIDDLEWARE_UPDATES,
  AUTH_ROUTES_UPDATES,
  REQUIRED_PACKAGES,
  ENV_ADDITIONS
};
