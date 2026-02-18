const JoinRequest = require('../models/JoinRequest');
const Event = require('../models/Event');
const Notification = require('../models/Notification');

// @desc    Create join request
// @route   POST /api/join-requests
// @access  Private
exports.createJoinRequest = async (req, res, next) => {
  try {
    const { eventId, message } = req.body;

    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Initialize participants array if undefined
    if (!event.participants) {
      event.participants = [];
    }

    // Check if user is already a participant
    if (event.participants.includes(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: 'You are already a participant of this event'
      });
    }

    // Check if event is full
    if (event.participants.length >= event.maxParticipants) {
      return res.status(400).json({
        success: false,
        message: 'Event is full'
      });
    }

    // Check if request already exists
    const existingRequest = await JoinRequest.findOne({
      user: req.user._id,
      event: eventId
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'Join request already exists'
      });
    }

    // Create join request
    const joinRequest = await JoinRequest.create({
      user: req.user._id,
      event: eventId,
      message
    });

    await joinRequest.populate('user', 'name avatar city languages');
    await joinRequest.populate('event', 'title date location');

    // Create notification for event host
    await Notification.create({
      recipient: event.host,
      sender: req.user._id,
      type: 'join_request',
      title: 'New Join Request',
      message: `${req.user.name} wants to join ${event.title}`,
      event: eventId,
      joinRequest: joinRequest._id,
      actionable: true
    });

    res.status(201).json({
      success: true,
      message: 'Join request sent successfully',
      data: joinRequest
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get join requests for an event (Host only)
// @route   GET /api/join-requests/event/:eventId
// @access  Private
exports.getEventJoinRequests = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const { status = 'pending' } = req.query;

    // Check if event exists and user is host
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    if (event.host.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view these join requests'
      });
    }

    const joinRequests = await JoinRequest.find({ event: eventId, status })
      .populate('user', 'name avatar bio city languages')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: joinRequests.length,
      data: joinRequests
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's join requests
// @route   GET /api/join-requests/my
// @access  Private
exports.getMyJoinRequests = async (req, res, next) => {
  try {
    const joinRequests = await JoinRequest.find({ user: req.user._id })
      .populate('event', 'title date location host')
      .populate({
        path: 'event',
        populate: {
          path: 'host',
          select: 'name avatar'
        }
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: joinRequests.length,
      data: joinRequests
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Accept join request
// @route   PUT /api/join-requests/:id/accept
// @access  Private (Host only)
exports.acceptJoinRequest = async (req, res, next) => {
  try {
    const joinRequest = await JoinRequest.findById(req.params.id)
      .populate('event')
      .populate('user', 'name avatar');

    if (!joinRequest) {
      return res.status(404).json({
        success: false,
        message: 'Join request not found'
      });
    }

    const event = joinRequest.event;

    // Check if user is event host
    if (event.host.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to accept this request'
      });
    }

    // Check if event is full
    if (event.participants.length >= event.maxParticipants) {
      return res.status(400).json({
        success: false,
        message: 'Event is full'
      });
    }

    // Update join request status
    joinRequest.status = 'accepted';
    await joinRequest.save();

    // Add user to event participants
    event.participants.push(joinRequest.user._id);
    await event.save();

    // Update the notification for the host (change it to show accepted)
    await Notification.findOneAndUpdate(
      {
        joinRequest: joinRequest._id,
        type: 'join_request'
      },
      {
        type: 'participant_joined',
        title: 'Request Accepted',
        message: `You accepted ${joinRequest.user.name} to join ${event.title}`,
        actionable: false,
        isRead: false
      }
    );

    // Create notification for requester
    await Notification.create({
      recipient: joinRequest.user._id,
      sender: req.user._id,
      type: 'request_accepted',
      title: 'Request Accepted',
      message: `Your request to join ${event.title} has been accepted!`,
      event: event._id
    });

    res.status(200).json({
      success: true,
      message: 'Join request accepted',
      data: joinRequest
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject join request
// @route   PUT /api/join-requests/:id/reject
// @access  Private (Host only)
exports.rejectJoinRequest = async (req, res, next) => {
  try {
    const joinRequest = await JoinRequest.findById(req.params.id)
      .populate('event')
      .populate('user', 'name avatar');

    if (!joinRequest) {
      return res.status(404).json({
        success: false,
        message: 'Join request not found'
      });
    }

    const event = joinRequest.event;

    // Check if user is event host
    if (event.host.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to reject this request'
      });
    }

    // Update join request status
    joinRequest.status = 'rejected';
    await joinRequest.save();

    // Update the notification for the host (change it to show declined)
    await Notification.findOneAndUpdate(
      {
        joinRequest: joinRequest._id,
        type: 'join_request'
      },
      {
        type: 'participant_left',
        title: 'Request Declined',
        message: `You declined ${joinRequest.user.name}'s request to join ${event.title}`,
        actionable: false,
        isRead: false
      }
    );

    // Create notification for requester
    await Notification.create({
      recipient: joinRequest.user._id,
      type: 'request_rejected',
      title: 'Request Declined',
      message: `Your request to join ${event.title} was declined`,
      event: event._id
    });

    res.status(200).json({
      success: true,
      message: 'Join request rejected',
      data: joinRequest
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel join request
// @route   DELETE /api/join-requests/:id
// @access  Private
exports.cancelJoinRequest = async (req, res, next) => {
  try {
    const joinRequest = await JoinRequest.findById(req.params.id);

    if (!joinRequest) {
      return res.status(404).json({
        success: false,
        message: 'Join request not found'
      });
    }

    // Check if user is the requester
    if (joinRequest.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this request'
      });
    }

    // Delete associated notification for event host
    await Notification.deleteOne({
      joinRequest: joinRequest._id,
      type: 'join_request'
    });

    await joinRequest.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Join request cancelled'
    });
  } catch (error) {
    next(error);
  }
};
