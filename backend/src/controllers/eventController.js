const Event = require('../models/Event');
const JoinRequest = require('../models/JoinRequest');
const Notification = require('../models/Notification');
const { reduceGPSPrecision } = require('../utils/geoPrivacy');

// @desc    Get all events (with filters)
// @route   GET /api/events
// @access  Public
exports.getEvents = async (req, res, next) => {
  try {
    const {
      category,
      language,
      city,
      dateFrom,
      dateTo,
      searchTerm,
      page = 1,
      limit = 20
    } = req.query;

    // Build query
    let query = { status: 'published', date: { $gte: new Date() } };

    if (category) query.category = category;
    if (language) query.languages = language;
    if (city) query.location = new RegExp(city, 'i');
    if (dateFrom) query.date = { ...query.date, $gte: new Date(dateFrom) };
    if (dateTo) query.date = { ...query.date, $lte: new Date(dateTo) };
    if (searchTerm) {
      query.$text = { $search: searchTerm };
    }

    // If user is authenticated, exclude events they're already in or have requested
    if (req.user) {
      // Exclude events where user is already a participant
      query.participants = { $ne: req.user._id };

      // Get events where user has pending join requests
      const pendingRequests = await JoinRequest.find({
        user: req.user._id,
        status: 'pending'
      }).select('event');
      
      const pendingEventIds = pendingRequests.map(req => req.event);
      
      // Exclude events with pending requests
      if (pendingEventIds.length > 0) {
        query._id = { $nin: pendingEventIds };
      }
    }

    // Execute query with pagination
    const events = await Event.find(query)
      .populate('host', 'name avatar city languages')
      .populate('participants', 'name avatar city bio languages')
      .sort({ date: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    // Get total count
    const count = await Event.countDocuments(query);

    res.status(200).json({
      success: true,
      count: events.length,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      data: events
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Public
exports.getEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('host', 'name avatar bio city languages')
      .populate('participants', 'name avatar city bio languages');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.status(200).json({
      success: true,
      data: event
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new event
// @route   POST /api/events
// @access  Private
exports.createEvent = async (req, res, next) => {
  try {
    // Add host to request body
    req.body.host = req.user._id;

    // CRITICAL: Reduce GPS precision for privacy (GDPR Article 5 - Data Minimization)
    // Reduces exact coordinates to ~110m precision (3 decimal places)
    if (req.body.coordinates && req.body.coordinates.lat && req.body.coordinates.lng) {
      const { lat, lng } = reduceGPSPrecision(
        req.body.coordinates.lat,
        req.body.coordinates.lng,
        3 // 3 decimals = ~110 meters precision
      );
      req.body.coordinates = { lat, lng };
    }

    const event = await Event.create(req.body);

    // Populate host details
    await event.populate('host', 'name avatar city languages');

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: event
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private (Host only)
exports.updateEvent = async (req, res, next) => {
  try {
    let event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if user is host
    if (event.host.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this event'
      });
    }

    // Prevent updating certain fields
    delete req.body.host;
    delete req.body.participants;

    // CRITICAL: Reduce GPS precision for privacy if coordinates updated
    if (req.body.coordinates && req.body.coordinates.lat && req.body.coordinates.lng) {
      const { lat, lng } = reduceGPSPrecision(
        req.body.coordinates.lat,
        req.body.coordinates.lng,
        3 // 3 decimals = ~110 meters precision
      );
      req.body.coordinates = { lat, lng };
    }

    event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('host', 'name avatar city languages');

    res.status(200).json({
      success: true,
      message: 'Event updated successfully',
      data: event
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private (Host only)
exports.deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if user is host
    if (event.host.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this event'
      });
    }

    // Notify participants
    const participants = event.participants.filter(
      p => p.toString() !== event.host.toString()
    );

    for (const participantId of participants) {
      const notification = await Notification.create({
        recipient: participantId,
        sender: req.user._id,
        type: 'event_cancelled',
        title: 'Event Cancelled',
        message: `${event.title} has been cancelled by the host`,
        event: event._id
      });

      // Populate notification for socket emission
      await notification.populate('sender', 'name avatar');
      await notification.populate('event', 'title');

      // Emit real-time notification via socket.io
      if (global.io) {
        global.io.to(`user_${participantId.toString()}`).emit('new_notification', notification);
      }
    }

    await event.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's created events
// @route   GET /api/events/my/created
// @access  Private
exports.getMyEvents = async (req, res, next) => {
  try {
    const events = await Event.find({ host: req.user._id })
      .populate('participants', 'name avatar city bio languages')
      .sort({ date: 1 });

    // Clean up pending requests for events that have already passed
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const event of events) {
      const eventDate = new Date(event.date);
      eventDate.setHours(0, 0, 0, 0);

      if (eventDate < today) {
        // Delete all pending requests for this past event
        await JoinRequest.deleteMany({ event: event._id, status: 'pending' });
      }
    }

    // Add pending request count for each event (only future events will have pending requests now)
    const eventsWithRequestCount = await Promise.all(
      events.map(async (event) => {
        const pendingCount = await JoinRequest.countDocuments({
          event: event._id,
          status: 'pending'
        });
        
        return {
          ...event.toObject(),
          pendingRequestCount: pendingCount
        };
      })
    );

    res.status(200).json({
      success: true,
      count: eventsWithRequestCount.length,
      data: eventsWithRequestCount
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's joined events
// @route   GET /api/events/my/joined
// @access  Private
exports.getJoinedEvents = async (req, res, next) => {
  try {
    const events = await Event.find({
      participants: req.user._id,
      host: { $ne: req.user._id }
    })
      .populate('host', 'name avatar city languages')
      .populate('participants', 'name avatar city bio languages')
      .sort({ date: 1 });

    res.status(200).json({
      success: true,
      count: events.length,
      data: events
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Leave event
// @route   POST /api/events/:id/leave
// @access  Private
exports.leaveEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if user is participant
    if (!event.participants.includes(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: 'You are not a participant of this event'
      });
    }

    // Cannot leave if you're the host
    if (event.host.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Host cannot leave their own event. Delete it instead.'
      });
    }

    // Remove user from participants
    event.participants = event.participants.filter(
      p => p.toString() !== req.user._id.toString()
    );
    await event.save();

    // Notify host
    const notification = await Notification.create({
      recipient: event.host,
      sender: req.user._id,
      type: 'participant_left',
      title: 'Participant Left',
      message: `${req.user.name} has left ${event.title}`,
      event: event._id
    });

    // Populate notification for socket emission
    await notification.populate('sender', 'name avatar');
    await notification.populate('event', 'title');

    // Emit real-time notification via socket.io
    if (global.io) {
      global.io.to(`user_${event.host.toString()}`).emit('new_notification', notification);
    }

    res.status(200).json({
      success: true,
      message: 'You have left the event'
    });
  } catch (error) {
    next(error);
  }
};
