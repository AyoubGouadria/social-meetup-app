const BlockedUser = require('../models/BlockedUser');
const Report = require('../models/Report');
const Event = require('../models/Event');

// ==========================================
// BLOCKING FUNCTIONALITY
// ==========================================

/**
 * @desc    Block a user
 * @route   POST /api/users/:id/block
 * @access  Private
 */
exports.blockUser = async (req, res, next) => {
  try {
    const { id: blockedUserId } = req.params;
    const { reason, notes } = req.body;

    // Validate reason
    const validReasons = ['harassment', 'spam', 'inappropriate', 'safety', 'fake_profile', 'other'];
    if (reason && !validReasons.includes(reason)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid block reason'
      });
    }

    // Prevent self-blocking
    if (blockedUserId === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot block yourself'
      });
    }

    // Check if already blocked
    const existing = await BlockedUser.findOne({
      userId: req.user._id,
      blockedUserId
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'User is already blocked'
      });
    }

    // Create block record
    const blocked = await BlockedUser.create({
      userId: req.user._id,
      blockedUserId,
      reason: reason || 'other',
      notes: notes || ''
    });

    // Remove blocked user from current user's events as participant
    await Event.updateMany(
      { host: req.user._id },
      { $pull: { participants: blockedUserId } }
    );

    // Remove current user from blocked user's events as participant
    await Event.updateMany(
      { host: blockedUserId },
      { $pull: { participants: req.user._id } }
    );

    res.status(200).json({
      success: true,
      message: 'User blocked successfully',
      data: blocked
    });
  } catch (error) {
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'User is already blocked'
      });
    }
    next(error);
  }
};

/**
 * @desc    Unblock a user
 * @route   DELETE /api/users/:id/unblock
 * @access  Private
 */
exports.unblockUser = async (req, res, next) => {
  try {
    const { id: blockedUserId } = req.params;

    const result = await BlockedUser.findOneAndDelete({
      userId: req.user._id,
      blockedUserId
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Block record not found'
      });
    }

    res.json({
      success: true,
      message: 'User unblocked successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get list of blocked users
 * @route   GET /api/users/blocked
 * @access  Private
 */
exports.getBlockedUsers = async (req, res, next) => {
  try {
    const blocked = await BlockedUser.find({ userId: req.user._id })
      .populate('blockedUserId', 'name avatar city')
      .sort('-createdAt')
      .lean();

    res.json({
      success: true,
      count: blocked.length,
      data: blocked
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Check if user is blocked
 * @route   GET /api/users/:id/is-blocked
 * @access  Private
 */
exports.checkIfBlocked = async (req, res, next) => {
  try {
    const { id: targetUserId } = req.params;

    const blocked = await BlockedUser.findOne({
      userId: req.user._id,
      blockedUserId: targetUserId
    });

    res.json({
      success: true,
      isBlocked: !!blocked
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// REPORTING FUNCTIONALITY
// ==========================================

/**
 * @desc    Create a report (user, event, or message)
 * @route   POST /api/reports
 * @access  Private
 */
exports.createReport = async (req, res, next) => {
  try {
    const { targetType, targetId, reason, description, screenshots } = req.body;

    // Validate inputs
    if (!targetType || !targetId || !reason || !description) {
      return res.status(400).json({
        success: false,
        message: 'Target type, target ID, reason, and description are required'
      });
    }

    if (description.length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Description must be at least 10 characters'
      });
    }

    // Validate targetType
    const validTypes = ['user', 'event', 'message'];
    if (!validTypes.includes(targetType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid target type. Must be user, event, or message'
      });
    }

    // Map targetType to model name
    const targetModel = targetType.charAt(0).toUpperCase() + targetType.slice(1);

    // Prevent reporting yourself
    if (targetType === 'user' && targetId === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot report yourself'
      });
    }

    // Check for duplicate reports within 24 hours
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const existingReport = await Report.findOne({
      reporterId: req.user._id,
      targetType,
      targetId,
      createdAt: { $gte: dayAgo }
    });

    if (existingReport) {
      return res.status(400).json({
        success: false,
        message: 'You have already reported this within the last 24 hours'
      });
    }

    // Determine priority based on reason
    let priority = 'medium';
    const urgentReasons = ['violence', 'illegal_activity', 'safety_concern'];
    const highReasons = ['harassment', 'hate_speech'];
    
    if (urgentReasons.includes(reason)) {
      priority = 'urgent';
    } else if (highReasons.includes(reason)) {
      priority = 'high';
    }

    // Create report
    const report = await Report.create({
      reporterId: req.user._id,
      targetType,
      targetId,
      targetModel,
      reason,
      description,
      screenshots: screenshots || [],
      priority,
      status: 'pending'
    });

    // Populate reporter info
    await report.populate('reporterId', 'name email');

    res.status(201).json({
      success: true,
      message: 'Report submitted successfully. Our team will review it shortly.',
      data: report
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user's own reports
 * @route   GET /api/reports/my-reports
 * @access  Private
 */
exports.getMyReports = async (req, res, next) => {
  try {
    const reports = await Report.find({ reporterId: req.user._id })
      .sort('-createdAt')
      .select('-reviewNotes -reviewedBy') // Hide internal review details
      .lean();

    res.json({
      success: true,
      count: reports.length,
      data: reports
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all reports (ADMIN ONLY)
 * @route   GET /api/reports/all
 * @access  Private + Admin
 */
exports.getAllReports = async (req, res, next) => {
  try {
    // TODO: Add admin role check middleware
    // For now, this is a placeholder for future admin functionality
    
    const { status, priority, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status) query.status = status;
    if (priority) query.priority = priority;

    const skip = (page - 1) * limit;

    const reports = await Report.find(query)
      .populate('reporterId', 'name email')
      .populate('reviewedBy', 'name email')
      .sort('-priority -createdAt')
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Report.countDocuments(query);

    res.json({
      success: true,
      count: reports.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: reports
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update report status (ADMIN ONLY)
 * @route   PATCH /api/reports/:id/status
 * @access  Private + Admin
 */
exports.updateReportStatus = async (req, res, next) => {
  try {
    // TODO: Add admin role check middleware
    
    const { id } = req.params;
    const { status, reviewNotes, actionTaken } = req.body;

    const report = await Report.findById(id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Update report
    report.status = status || report.status;
    report.reviewNotes = reviewNotes || report.reviewNotes;
    report.actionTaken = actionTaken || report.actionTaken;
    report.reviewedBy = req.user._id;
    report.reviewedAt = Date.now();

    await report.save();

    res.json({
      success: true,
      message: 'Report updated successfully',
      data: report
    });
  } catch (error) {
    next(error);
  }
};
