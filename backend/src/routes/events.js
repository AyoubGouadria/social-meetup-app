const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const validate = require('../middleware/validation');
const { protect, optionalAuth } = require('../middleware/auth');
const {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  getMyEvents,
  getJoinedEvents,
  leaveEvent
} = require('../controllers/eventController');

// Validation rules
const eventValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('category').trim().isLength({ min: 3, max: 30 }).withMessage('Category must be between 3 and 30 characters'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('time').notEmpty().withMessage('Time is required'),
  body('location').notEmpty().withMessage('Location is required'),
  body('maxParticipants').isInt({ min: 2, max: 50 }).withMessage('Max participants must be between 2 and 50'),
  body('languages').isArray({ min: 1 }).withMessage('At least one language is required')
];

// Routes
router.get('/', optionalAuth, getEvents);
router.get('/my/created', protect, getMyEvents);
router.get('/my/joined', protect, getJoinedEvents);
router.get('/:id', getEvent);
router.post('/', protect, eventValidation, validate, createEvent);
router.put('/:id', protect, updateEvent);
router.delete('/:id', protect, deleteEvent);
router.post('/:id/leave', protect, leaveEvent);

module.exports = router;
