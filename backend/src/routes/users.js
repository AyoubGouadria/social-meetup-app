const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  searchUsers,
  likeUser,
  unlikeUser,
  exportUserData,
  deleteAccount,
  updateGdprConsent
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');

// Public Routes
router.get('/', searchUsers);
router.get('/:id', getUserProfile);

// Protected Routes
router.post('/:id/like', protect, likeUser);
router.delete('/:id/like', protect, unlikeUser);

// GDPR Compliance Routes
router.get('/me/export', protect, exportUserData);
router.delete('/me', protect, deleteAccount);
router.put('/me/gdpr-consent', protect, updateGdprConsent);

module.exports = router;
