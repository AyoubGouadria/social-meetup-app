const User = require('../models/User');
const Event = require('../models/Event');
const { generateToken, getCookieOptions } = require('../config/jwt');

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { 
      name, email, password, city, languages, avatar, images, bio,
      age, gender, interests, lookingFor,
      // Legal consent fields
      ageVerified, acceptedTermsVersion, acceptedPrivacyVersion,
      gdprConsent
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // GDPR Compliance: Validate age verification (JuSchG requirement)
    if (!ageVerified || ageVerified !== true) {
      return res.status(400).json({
        success: false,
        message: 'You must verify that you are 18 or older to register',
        code: 'AGE_VERIFICATION_REQUIRED'
      });
    }

    // GDPR Compliance: Validate consent to Terms & Privacy Policy
    if (!acceptedTermsVersion || !acceptedPrivacyVersion) {
      return res.status(400).json({
        success: false,
        message: 'You must accept the Terms of Service and Privacy Policy',
        code: 'CONSENT_REQUIRED'
      });
    }

    // GDPR Compliance: Validate explicit consent for data processing
    if (!gdprConsent || !gdprConsent.necessary) {
      return res.status(400).json({
        success: false,
        message: 'Explicit consent is required for data processing',
        code: 'GDPR_CONSENT_REQUIRED'
      });
    }

    // Create user object with minimized data (GDPR Article 5)
    const userData = {
      name,
      email,
      password,
      city,
      languages,
      avatar,
      images,
      bio,
      // Age verification
      ageVerified: true,
      ageVerifiedDate: new Date(),
      ageVerificationMethod: 'checkbox',
      // Legal consent tracking
      acceptedTermsVersion,
      acceptedTermsDate: new Date(),
      acceptedPrivacyVersion,
      acceptedPrivacyDate: new Date(),
      // GDPR consent
      gdprConsent: {
        necessary: gdprConsent.necessary || false,
        analytics: gdprConsent.analytics || false,
        marketing: gdprConsent.marketing || false,
        consentDate: new Date(),
        ipAddress: req.ip || req.connection.remoteAddress,
        lastUpdated: new Date()
      }
    };

    // Add optional fields if provided (data minimization)
    if (age) userData.age = age;
    if (gender) userData.gender = gender;
    if (interests) userData.interests = interests;
    if (lookingFor) userData.lookingFor = lookingFor;

    // Create user
    const user = await User.create(userData);

    // Fetch user again to include virtual fields and likedBy
    const createdUser = await User.findById(user._id).select('+likedBy');

    // Generate token
    const token = generateToken(user._id);

    // Set HttpOnly cookie
    res.cookie('token', token, getCookieOptions());

    // Add event counts (will be 0 for new users)
    const userWithCounts = {
      ...createdUser.toObject(),
      hostedEventsCount: 0,
      joinedEventsCount: 0
    };

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: userWithCounts,
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Check for user (include password for comparison)
    const user = await User.findOne({ email }).select('+password +likedBy');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last active
    user.lastActive = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    // Set HttpOnly cookie
    res.cookie('token', token, getCookieOptions());

    // Remove password from response
    user.password = undefined;

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

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: userWithCounts,
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('+likedBy');

    // Get event counts
    const hostedEventsCount = await Event.countDocuments({
      host: req.user._id,
      status: 'published'
    });
    const joinedEventsCount = await Event.countDocuments({
      participants: req.user._id,
      status: 'published',
      date: { $lt: new Date() }
    });

    const userWithCounts = {
      ...user.toObject(),
      hostedEventsCount,
      joinedEventsCount
    };

    res.status(200).json({
      success: true,
      data: userWithCounts
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    // Only allow updating non-sensitive fields (GDPR data minimization)
    const fieldsToUpdate = {
      name: req.body.name,
      bio: req.body.bio,
      city: req.body.city,
      languages: req.body.languages,
      avatar: req.body.avatar,
      age: req.body.age,
      gender: req.body.gender,
      interests: req.body.interests,
      lookingFor: req.body.lookingFor
    };

    // Remove undefined fields
    Object.keys(fieldsToUpdate).forEach(key => 
      fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
    );

    const user = await User.findByIdAndUpdate(
      req.user._id,
      fieldsToUpdate,
      {
        new: true,
        runValidators: true
      }
    ).select('+likedBy');

    // Get event counts
    const hostedEventsCount = await Event.countDocuments({
      host: req.user._id,
      status: 'published'
    });
    const joinedEventsCount = await Event.countDocuments({
      participants: req.user._id,
      status: 'published',
      date: { $lt: new Date() }
    });

    const userWithCounts = {
      ...user.toObject(),
      hostedEventsCount,
      joinedEventsCount
    };

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: userWithCounts
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/auth/password
// @access  Private
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');

    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Set new password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
  try {
    // Clear HttpOnly cookie
    res.cookie('token', '', {
      httpOnly: true,
      expires: new Date(0), // Expire immediately
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
