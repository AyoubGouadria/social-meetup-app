const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const validate = require('../middleware/validation');
const { protect } = require('../middleware/auth');
const {
  createJoinRequest,
  getEventJoinRequests,
  getMyJoinRequests,
  acceptJoinRequest,
  rejectJoinRequest,
  cancelJoinRequest
} = require('../controllers/joinRequestController');

// Validation rules
const joinRequestValidation = [
  body('eventId').notEmpty().withMessage('Event ID is required'),
  body('message').optional().isLength({ max: 200 }).withMessage('Message cannot exceed 200 characters')
];

// Routes
router.post('/', protect, joinRequestValidation, validate, createJoinRequest);
router.get('/event/:eventId', protect, getEventJoinRequests);
router.get('/my', protect, getMyJoinRequests);
router.put('/:id/accept', protect, acceptJoinRequest);
router.put('/:id/reject', protect, rejectJoinRequest);
router.delete('/:id', protect, cancelJoinRequest);

module.exports = router;
