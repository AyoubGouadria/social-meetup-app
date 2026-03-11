// Notification handler for real-time notifications
const notificationHandler = (io) => {
  // Function to emit notification to a specific user
  const emitNotificationToUser = (userId, notification) => {
    io.to(`user_${userId}`).emit('new_notification', notification);
  };

  // Function to emit notification update to a specific user
  const emitNotificationUpdate = (userId, notification) => {
    io.to(`user_${userId}`).emit('notification_updated', notification);
  };

  return {
    emitNotificationToUser,
    emitNotificationUpdate
  };
};

module.exports = notificationHandler;
