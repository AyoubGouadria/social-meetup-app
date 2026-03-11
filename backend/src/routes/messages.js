const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const validate = require('../middleware/validation');
const { protect } = require('../middleware/auth');
const {
  getUserConversations,
  getEventMessages,
  sendMessage,
  markMessagesAsRead
} = require('../controllers/messageController');

// Validation rules
const messageValidation = [
  body('eventId').notEmpty().withMessage('Event ID is required'),
  body('text').trim().notEmpty().withMessage('Message text is required').isLength({ max: 1000 })
];

// Routes
router.get('/conversations', protect, getUserConversations);
router.get('/event/:eventId', protect, getEventMessages);
router.post('/', protect, messageValidation, validate, sendMessage);
router.put('/read/:eventId', protect, markMessagesAsRead);

module.exports = router;
