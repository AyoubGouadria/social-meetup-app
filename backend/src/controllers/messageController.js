const Message = require('../models/Message');
const Event = require('../models/Event');
const Notification = require('../models/Notification');

// @desc    Get all conversations for the current user
// @route   GET /api/messages/conversations
// @access  Private
exports.getUserConversations = async (req, res, next) => {
  try {
    // Find all events where user is a participant
    const events = await Event.find({
      participants: req.user._id,
      status: 'published'
    })
      .populate('host', 'name avatar')
      .sort({ date: -1 });

    console.log(`Found ${events.length} events for user ${req.user._id}`);

    // For each event, get the latest message and unread count
    const conversations = await Promise.all(
      events.map(async (event) => {
        const lastMessage = await Message.findOne({ event: event._id })
          .sort({ createdAt: -1 })
          .populate('user', 'name avatar');

        const unreadCount = await Message.countDocuments({
          event: event._id,
          user: { $ne: req.user._id },
          isRead: { $ne: req.user._id }
        });

        const totalMessages = await Message.countDocuments({ event: event._id });

        return {
          event: {
            _id: event._id,
            title: event.title,
            category: event.category,
            startTime: event.date,
            creator: event.host,
            participantCount: event.participants.length
          },
          lastMessage: lastMessage ? {
            text: lastMessage.text,
            createdAt: lastMessage.createdAt,
            user: lastMessage.user
          } : null,
          unreadCount,
          totalMessages
        };
      })
    );

    // Sort conversations by last message time
    conversations.sort((a, b) => {
      const timeA = a.lastMessage ? new Date(a.lastMessage.createdAt).getTime() : 0;
      const timeB = b.lastMessage ? new Date(b.lastMessage.createdAt).getTime() : 0;
      return timeB - timeA;
    });

    console.log(`Returning ${conversations.length} conversations`);

    res.status(200).json({
      success: true,
      count: conversations.length,
      data: conversations
    });
  } catch (error) {
    next(error);
  }
};

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

    // Create notifications for all participants except the sender
    const participants = event.participants.filter(
      p => p.toString() !== req.user._id.toString()
    );

    for (const participantId of participants) {
      const notification = await Notification.create({
        recipient: participantId,
        sender: req.user._id,
        type: 'new_message',
        title: 'New Message',
        message: `${req.user.name} sent a message in ${event.title}`,
        event: eventId
      });

      // Populate notification for socket emission
      await notification.populate('sender', 'name avatar');
      await notification.populate('event', 'title');

      // Emit real-time notification via socket.io
      if (global.io) {
        global.io.to(`user_${participantId.toString()}`).emit('new_notification', notification);
      }
    }

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

    console.log(`Marking messages as read for event ${eventId} by user ${req.user._id}`);

    const result = await Message.updateMany(
      {
        event: eventId,
        user: { $ne: req.user._id },
        isRead: { $ne: req.user._id }
      },
      {
        $addToSet: { isRead: req.user._id }
      }
    );

    console.log(`Marked ${result.modifiedCount} messages as read`);

    res.status(200).json({
      success: true,
      message: 'Messages marked as read',
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    next(error);
  }
};
