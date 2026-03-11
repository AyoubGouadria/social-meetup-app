const Message = require('../models/Message');
const Event = require('../models/Event');
const Notification = require('../models/Notification');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Store active connections
const activeUsers = new Map();

const chatHandler = (io) => {
  // Authentication middleware for Socket.IO
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        return next(new Error('User not found'));
      }

      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`✅ User connected: ${socket.user.name} (${socket.userId})`);

    // Store active user
    activeUsers.set(socket.userId, socket.id);

    // Join user's personal room for notifications
    socket.join(`user_${socket.userId}`);
    console.log(`User ${socket.user.name} joined personal room`);

    // Join event rooms
    socket.on('join_event', async ({ eventId }) => {
      try {
        const event = await Event.findById(eventId);

        if (!event) {
          socket.emit('error', { message: 'Event not found' });
          return;
        }

        // Check if user is participant
        if (!event.participants.includes(socket.userId)) {
          socket.emit('error', { message: 'Not authorized' });
          return;
        }

        socket.join(`event_${eventId}`);
        console.log(`User ${socket.user.name} joined event ${eventId}`);

        // Notify others
        socket.to(`event_${eventId}`).emit('user_joined', {
          userId: socket.userId,
          userName: socket.user.name
        });
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    // Leave event room
    socket.on('leave_event', ({ eventId }) => {
      socket.leave(`event_${eventId}`);
      socket.to(`event_${eventId}`).emit('user_left', {
        userId: socket.userId,
        userName: socket.user.name
      });
    });

    // Send message
    socket.on('send_message', async ({ eventId, text }) => {
      try {
        const event = await Event.findById(eventId);

        if (!event) {
          socket.emit('error', { message: 'Event not found' });
          return;
        }

        // Check if user is participant
        if (!event.participants.includes(socket.userId)) {
          socket.emit('error', { message: 'Not authorized' });
          return;
        }

        // Create message
        const message = await Message.create({
          event: eventId,
          user: socket.userId,
          text,
          type: 'user'
        });

        await message.populate('user', 'name avatar');

        // Emit to all users in event room
        io.to(`event_${eventId}`).emit('new_message', message);

        // Create notifications for all participants except the sender
        const participants = event.participants.filter(
          p => p.toString() !== socket.userId.toString()
        );

        for (const participantId of participants) {
          const notification = await Notification.create({
            recipient: participantId,
            sender: socket.userId,
            type: 'new_message',
            title: 'New Message',
            message: `${socket.user.name} sent a message in ${event.title}`,
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
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    // Typing indicator
    socket.on('typing_start', ({ eventId }) => {
      socket.to(`event_${eventId}`).emit('user_typing', {
        userId: socket.userId,
        userName: socket.user.name
      });
    });

    socket.on('typing_stop', ({ eventId }) => {
      socket.to(`event_${eventId}`).emit('user_stopped_typing', {
        userId: socket.userId
      });
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log(`❌ User disconnected: ${socket.user.name}`);
      activeUsers.delete(socket.userId);
    });
  });
};

module.exports = chatHandler;
