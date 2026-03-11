const express = require('express');
const router = express.Router();
const {
  blockUser,
  unblockUser,
  getBlockedUsers,
  checkIfBlocked,
  createReport,
  getMyReports,
  getAllReports,
  updateReportStatus
} = require('../controllers/moderationController');
const { protect } = require('../middleware/auth');

// =========================
// BLOCKING ROUTES
// =========================

// @route   POST /api/moderation/users/:id/block
// @desc    Block a user
// @access  Private
router.post('/users/:id/block', protect, blockUser);

// @route   DELETE /api/moderation/users/:id/unblock
// @desc    Unblock a user
// @access  Private
router.delete('/users/:id/unblock', protect, unblockUser);

// @route   GET /api/moderation/users/blocked
// @desc    Get list of blocked users
// @access  Private
router.get('/users/blocked', protect, getBlockedUsers);

// @route   GET /api/moderation/users/:id/is-blocked
// @desc    Check if a user is blocked
// @access  Private
router.get('/users/:id/is-blocked', protect, checkIfBlocked);

// =========================
// REPORTING ROUTES
// =========================

// @route   POST /api/moderation/reports
// @desc    Create a report (user, event, or message)
// @access  Private
router.post('/reports', protect, createReport);

// @route   GET /api/moderation/reports/my-reports
// @desc    Get user's own reports
// @access  Private
router.get('/reports/my-reports', protect, getMyReports);

// @route   GET /api/moderation/reports/all
// @desc    Get all reports (ADMIN ONLY - TODO: Add admin middleware)
// @access  Private + Admin
router.get('/reports/all', protect, getAllReports);

// @route   PATCH /api/moderation/reports/:id/status
// @desc    Update report status (ADMIN ONLY - TODO: Add admin middleware)
// @access  Private + Admin
router.patch('/reports/:id/status', protect, updateReportStatus);

module.exports = router;
