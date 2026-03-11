const User = require('../models/User');
const Event = require('../models/Event');
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const JoinRequest = require('../models/JoinRequest');

// @desc    Get user profile
// @route   GET /api/users/:id
// @access  Public
exports.getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .populate({
        path: 'hostedEvents',
        match: { status: 'published' },
        select: 'title date location category participants'
      })
      .select('+likedBy');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get count of hosted events (created events)
    const hostedEventsCount = await Event.countDocuments({
      host: req.params.id,
      status: 'published'
    });

    // Get count of joined events (as participant) that are in the past
    const joinedEventsCount = await Event.countDocuments({
      participants: req.params.id,
      status: 'published',
      date: { $lt: new Date() }
    });

    // Add counts to user object
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

// @desc    Search users
// @route   GET /api/users
// @access  Public
exports.searchUsers = async (req, res, next) => {
  try {
    const { search, city, language, page = 1, limit = 20 } = req.query;

    let query = {};

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    if (city) {
      query.city = { $regex: city, $options: 'i' };
    }
    if (language) {
      query.languages = language;
    }

    const users = await User.find(query)
      .select('name avatar city languages bio')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      count: users.length,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Like a user
// @route   POST /api/users/:id/like
// @access  Private
exports.likeUser = async (req, res, next) => {
  try {
    const userToLike = await User.findById(req.params.id);
    
    if (!userToLike) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if already liked
    if (userToLike.likedBy.includes(req.user.id)) {
      return res.status(400).json({
        success: false,
        message: 'You have already liked this user'
      });
    }

    // Add the current user to likedBy array
    userToLike.likedBy.push(req.user.id);
    await userToLike.save();

    res.status(200).json({
      success: true,
      message: 'User liked successfully',
      data: {
        likesCount: userToLike.likedBy.length,
        isLiked: true
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Unlike a user
// @route   DELETE /api/users/:id/like
// @access  Private
exports.unlikeUser = async (req, res, next) => {
  try {
    const userToUnlike = await User.findById(req.params.id);
    
    if (!userToUnlike) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if not liked
    if (!userToUnlike.likedBy.includes(req.user.id)) {
      return res.status(400).json({
        success: false,
        message: 'You have not liked this user'
      });
    }

    // Remove the current user from likedBy array
    userToUnlike.likedBy = userToUnlike.likedBy.filter(
      userId => userId.toString() !== req.user.id.toString()
    );
    await userToUnlike.save();

    res.status(200).json({
      success: true,
      message: 'User unliked successfully',
      data: {
        likesCount: userToUnlike.likedBy.length,
        isLiked: false
      }
    });
  } catch (error) {
    next(error);
  }
};

// ═══════════════════════════════════════════════════════════════
// GDPR COMPLIANCE ENDPOINTS
// ═══════════════════════════════════════════════════════════════

// @desc    Export user data (GDPR Article 20 - Right to Data Portability)
// @route   GET /api/users/me/export
// @access  Private
exports.exportUserData = async (req, res, next) => {
  try {
    // Get user with all data
    const user = await User.findById(req.user._id).select('+likedBy');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get all related data
    const hostedEvents = await Event.find({ host: req.user._id });
    const participatedEvents = await Event.find({ participants: req.user._id });
    const messages = await Message.find({ sender: req.user._id });
    const notifications = await Notification.find({ recipient: req.user._id });
    const sentJoinRequests = await JoinRequest.find({ user: req.user._id });
    const receivedJoinRequests = await JoinRequest.find({ event: { $in: hostedEvents.map(e => e._id) } });

    // Compile all user data (GDPR Article 20 - Right to Data Portability)
    const exportData = {
      export_info: {
        exported_at: new Date().toISOString(),
        format: 'JSON',
        gdpr_article: 'Article 20 - Right to Data Portability'
      },
      personal_data: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        images: user.images,
        bio: user.bio,
        city: user.city,
        languages: user.languages,
        age: user.age,
        gender: user.gender,
        interests: user.interests,
        lookingFor: user.lookingFor,
        createdAt: user.createdAt,
        lastActive: user.lastActive,
        // Age verification
        ageVerified: user.ageVerified,
        ageVerifiedDate: user.ageVerifiedDate,
        ageVerificationMethod: user.ageVerificationMethod,
        // Email verification
        isEmailVerified: user.isEmailVerified,
        emailVerifiedAt: user.emailVerifiedAt,
        // Legal consent tracking
        acceptedTermsVersion: user.acceptedTermsVersion,
        acceptedTermsDate: user.acceptedTermsDate,
        acceptedPrivacyVersion: user.acceptedPrivacyVersion,
        acceptedPrivacyDate: user.acceptedPrivacyDate,
        // GDPR consent preferences
        gdprConsent: user.gdprConsent
      },
      activity_data: {
        hosted_events_count: hostedEvents.length,
        hosted_events: hostedEvents,
        participated_events_count: participatedEvents.length,
        participated_events: participatedEvents,
        messages_sent_count: messages.length,
        messages_sent: messages,
        notifications_count: notifications.length,
        notifications: notifications,
        join_requests_sent_count: sentJoinRequests.length,
        join_requests_sent: sentJoinRequests,
        join_requests_received_count: receivedJoinRequests.length,
        join_requests_received: receivedJoinRequests,
        likes_received_count: user.likedBy ? user.likedBy.length : 0
      },
      data_usage: {
        purpose: 'Social connection and event management',
        retention_period: '2 years of inactivity',
        data_processors: ['MongoDB', 'Cloudinary (images)']
      }
    };

    // Set response headers for file download
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="meetly-data-export-${req.user._id}-${Date.now()}.json"`);
    
    res.status(200).json(exportData);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user account and all data (GDPR Article 17 - Right to Erasure)
// @route   DELETE /api/users/me
// @access  Private
exports.deleteAccount = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Verify password for security
    const user = await User.findById(userId).select('+password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if password provided
    if (!req.body.password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your password to confirm account deletion'
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(req.body.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password'
      });
    }

    // CRITICAL: Delete Cloudinary images (GDPR compliance - Important Issue #10)
    const { extractPublicIds, deleteMultipleImages } = require('../config/cloudinary');
    const imageUrls = [];
    
    // Collect all image URLs
    if (user.avatar) imageUrls.push(user.avatar);
    if (user.images && user.images.length > 0) imageUrls.push(...user.images);
    
    // Extract public IDs and delete from Cloudinary
    if (imageUrls.length > 0) {
      const publicIds = extractPublicIds(imageUrls);
      if (publicIds.length > 0) {
        await deleteMultipleImages(publicIds);
      }
    }

    // Delete all user-related data (GDPR Right to Erasure)
    await Promise.all([
      // Delete messages sent by user
      Message.deleteMany({ sender: userId }),
      
      // Delete notifications (sent and received)
      Notification.deleteMany({ $or: [{ sender: userId }, { recipient: userId }] }),
      
      // Delete join requests
      JoinRequest.deleteMany({ user: userId }),
      
      // Delete blocking records (both directions)
      require('../models/BlockedUser').deleteMany({
        $or: [{ userId }, { blockedUserId: userId }]
      }),
      
      // Delete reports (created by user or targeting user)
      require('../models/Report').deleteMany({
        $or: [
          { reporterId: userId },
          { targetType: 'user', targetId: userId }
        ]
      }),
      
      // Remove user from event participants
      Event.updateMany(
        { participants: userId },
        { $pull: { participants: userId } }
      ),
      
      // Remove user from likedBy arrays
      User.updateMany(
        { likedBy: userId },
        { $pull: { likedBy: userId } }
      ),
      
      // Delete all hosted events
      Event.deleteMany({ host: userId })
    ]);

    // Finally, delete the user account
    await User.findByIdAndDelete(userId);

    res.status(200).json({
      success: true,
      message: 'Account and all associated data have been permanently deleted',
      deleted_at: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update GDPR consent preferences
// @route   PUT /api/users/me/gdpr-consent
// @access  Private
exports.updateGdprConsent = async (req, res, next) => {
  try {
    const { necessary, analytics, marketing } = req.body;
    
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // CRITICAL: Necessary consent must be explicit (GDPR Article 7)
    // User must actively provide consent, not default to true
    if (necessary === undefined && !user.gdprConsent?.necessary) {
      return res.status(400).json({
        success: false,
        message: 'Explicit consent for necessary data processing is required',
        code: 'CONSENT_REQUIRED'
      });
    }

    // Update consent preferences
    user.gdprConsent = {
      necessary: necessary !== undefined ? necessary : user.gdprConsent?.necessary || false,
      analytics: analytics !== undefined ? analytics : user.gdprConsent?.analytics || false,
      marketing: marketing !== undefined ? marketing : user.gdprConsent?.marketing || false,
      consentDate: user.gdprConsent?.consentDate || new Date(),
      ipAddress: req.ip || req.connection.remoteAddress,
      lastUpdated: new Date()
    };

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Consent preferences updated successfully',
      data: user.gdprConsent
    });
  } catch (error) {
    next(error);
  }
};
