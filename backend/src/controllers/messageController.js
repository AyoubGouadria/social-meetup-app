const Message = require('../models/Message');
const Event = require('../models/Event');

// @desc    Get messages for an event
// @route   GET /api/messages/event/:eventId
// @access  Private
exports.getEventMessages = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if user is participant
    if (!event.participants.includes(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view these messages'
      });
    }

    const messages = await Message.find({ event: eventId })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Message.countDocuments({ event: eventId });

    res.status(200).json({
      success: true,
      count: messages.length,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      data: messages.reverse() // Return in chronological order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Send a message (Also handled by WebSocket)
// @route   POST /api/messages
// @access  Private
exports.sendMessage = async (req, res, next) => {
  try {
    const { eventId, text } = req.body;

    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if user is participant
    if (!event.participants.includes(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to send messages to this event'
      });
    }

    const message = await Message.create({
      event: eventId,
      user: req.user._id,
      text,
      type: 'user'
    });

    await message.populate('user', 'name avatar');

    res.status(201).json({
      success: true,
      data: message
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark messages as read
// @route   PUT /api/messages/read/:eventId
// @access  Private
exports.markMessagesAsRead = async (req, res, next) => {
  try {
    const { eventId } = req.params;

    await Message.updateMany(
      {
        event: eventId,
        user: { $ne: req.user._id },
        isRead: { $ne: req.user._id }
      },
      {
        $addToSet: { isRead: req.user._id }
      }
    );

    res.status(200).json({
      success: true,
      message: 'Messages marked as read'
    });
  } catch (error) {
    next(error);
  }
};
