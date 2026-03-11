const User = require('../models/User');
const Event = require('../models/Event');
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const JoinRequest = require('../models/JoinRequest');

/**
 * Data Retention Policy Service
 * Implements GDPR-compliant data retention rules
 * Run this service periodically (e.g., daily via cron job)
 */

// Configuration
const RETENTION_PERIODS = {
  INACTIVE_ACCOUNTS: 2 * 365, // 2 years in days
  OLD_MESSAGES: 365, // 1 year
  OLD_NOTIFICATIONS: 90, // 90 days
  COMPLETED_EVENTS: 180, // 6 months after event date
  REJECTED_JOIN_REQUESTS: 30, // 30 days
};

/**
 * Delete inactive user accounts (no activity for 2 years)
 */
const deleteInactiveAccounts = async () => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - RETENTION_PERIODS.INACTIVE_ACCOUNTS);

    const inactiveUsers = await User.find({
      lastActive: { $lt: cutoffDate },
      // Don't delete if user has upcoming events they're hosting
      $or: [
        { _id: { $nin: await Event.distinct('host', { date: { $gte: new Date() } }) } }
      ]
    });

    const deletedCount = inactiveUsers.length;
    
    for (const user of inactiveUsers) {
      // Cascading deletions
      await Promise.all([
        Message.deleteMany({ sender: user._id }),
        Notification.deleteMany({ $or: [{ sender: user._id }, { recipient: user._id }] }),
        JoinRequest.deleteMany({ user: user._id }),
        Event.updateMany({ participants: user._id }, { $pull: { participants: user._id } }),
        User.updateMany({ likedBy: user._id }, { $pull: { likedBy: user._id } }),
        Event.deleteMany({ host: user._id, date: { $lt: new Date() } }) // Only delete past events
      ]);
      
      await User.findByIdAndDelete(user._id);
    }

    console.log(`✅ Data Retention: Deleted ${deletedCount} inactive accounts`);
    return { success: true, deletedCount };
  } catch (error) {
    console.error('❌ Error deleting inactive accounts:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Delete old messages (older than 1 year)
 */
const deleteOldMessages = async () => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - RETENTION_PERIODS.OLD_MESSAGES);

    const result = await Message.deleteMany({
      createdAt: { $lt: cutoffDate }
    });

    console.log(`✅ Data Retention: Deleted ${result.deletedCount} old messages`);
    return { success: true, deletedCount: result.deletedCount };
  } catch (error) {
    console.error('❌ Error deleting old messages:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Delete old notifications (older than 90 days)
 */
const deleteOldNotifications = async () => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - RETENTION_PERIODS.OLD_NOTIFICATIONS);

    const result = await Notification.deleteMany({
      createdAt: { $lt: cutoffDate }
    });

    console.log(`✅ Data Retention: Deleted ${result.deletedCount} old notifications`);
    return { success: true, deletedCount: result.deletedCount };
  } catch (error) {
    console.error('❌ Error deleting old notifications:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Archive or delete old completed events (6 months after event date)
 */
const archiveOldEvents = async () => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - RETENTION_PERIODS.COMPLETED_EVENTS);

    // Delete events that are completed and older than retention period
    const result = await Event.deleteMany({
      date: { $lt: cutoffDate },
      status: { $in: ['published', 'completed'] }
    });

    console.log(`✅ Data Retention: Archived/deleted ${result.deletedCount} old events`);
    return { success: true, deletedCount: result.deletedCount };
  } catch (error) {
    console.error('❌ Error archiving old events:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Delete rejected join requests (older than 30 days)
 */
const deleteRejectedJoinRequests = async () => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - RETENTION_PERIODS.REJECTED_JOIN_REQUESTS);

    const result = await JoinRequest.deleteMany({
      status: 'rejected',
      createdAt: { $lt: cutoffDate }
    });

    console.log(`✅ Data Retention: Deleted ${result.deletedCount} rejected join requests`);
    return { success: true, deletedCount: result.deletedCount };
  } catch (error) {
    console.error('❌ Error deleting rejected join requests:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Run all data retention policies
 */
const runDataRetentionPolicies = async () => {
  console.log('🔄 Starting data retention policy execution...');
  
  const startTime = Date.now();
  
  const results = {
    timestamp: new Date(),
    policies: {
      inactiveAccounts: await deleteInactiveAccounts(),
      oldMessages: await deleteOldMessages(),
      oldNotifications: await deleteOldNotifications(),
      oldEvents: await archiveOldEvents(),
      rejectedJoinRequests: await deleteRejectedJoinRequests()
    },
    duration: `${Date.now() - startTime}ms`
  };

  console.log('✅ Data retention policy execution completed');
  console.log(`📊 Summary:`, {
    inactiveAccounts: results.policies.inactiveAccounts.deletedCount || 0,
    oldMessages: results.policies.oldMessages.deletedCount || 0,
    oldNotifications: results.policies.oldNotifications.deletedCount || 0,
    oldEvents: results.policies.oldEvents.deletedCount || 0,
    rejectedJoinRequests: results.policies.rejectedJoinRequests.deletedCount || 0,
    duration: results.duration
  });

  return results;
};

/**
 * Get data retention status/statistics
 */
const getDataRetentionStatus = async () => {
  try {
    const cutoffDates = {
      inactiveAccounts: new Date(Date.now() - RETENTION_PERIODS.INACTIVE_ACCOUNTS * 24 * 60 * 60 * 1000),
      oldMessages: new Date(Date.now() - RETENTION_PERIODS.OLD_MESSAGES * 24 * 60 * 60 * 1000),
      oldNotifications: new Date(Date.now() - RETENTION_PERIODS.OLD_NOTIFICATIONS * 24 * 60 * 60 * 1000),
      oldEvents: new Date(Date.now() - RETENTION_PERIODS.COMPLETED_EVENTS * 24 * 60 * 60 * 1000),
      rejectedJoinRequests: new Date(Date.now() - RETENTION_PERIODS.REJECTED_JOIN_REQUESTS * 24 * 60 * 60 * 1000)
    };

    const [inactiveAccountsCount, oldMessagesCount, oldNotificationsCount, oldEventsCount, rejectedRequestsCount] = await Promise.all([
      User.countDocuments({ lastActive: { $lt: cutoffDates.inactiveAccounts } }),
      Message.countDocuments({ createdAt: { $lt: cutoffDates.oldMessages } }),
      Notification.countDocuments({ createdAt: { $lt: cutoffDates.oldNotifications } }),
      Event.countDocuments({ date: { $lt: cutoffDates.oldEvents }, status: { $in: ['published', 'completed'] } }),
      JoinRequest.countDocuments({ status: 'rejected', createdAt: { $lt: cutoffDates.rejectedJoinRequests } })
    ]);

    return {
      success: true,
      retentionPeriods: RETENTION_PERIODS,
      pendingDeletion: {
        inactiveAccounts: inactiveAccountsCount,
        oldMessages: oldMessagesCount,
        oldNotifications: oldNotificationsCount,
        oldEvents: oldEventsCount,
        rejectedJoinRequests: rejectedRequestsCount,
        total: inactiveAccountsCount + oldMessagesCount + oldNotificationsCount + oldEventsCount + rejectedRequestsCount
      }
    };
  } catch (error) {
    console.error('❌ Error getting data retention status:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  runDataRetentionPolicies,
  deleteInactiveAccounts,
  deleteOldMessages,
  deleteOldNotifications,
  archiveOldEvents,
  deleteRejectedJoinRequests,
  getDataRetentionStatus,
  RETENTION_PERIODS
};
