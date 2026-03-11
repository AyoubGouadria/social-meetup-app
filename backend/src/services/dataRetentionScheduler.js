const cron = require('node-cron');
const { runDataRetentionPolicies } = require('./dataRetention');

/**
 * Data Retention Scheduler
 * Runs data retention policies on a daily schedule
 * Uses cron jobs to automate cleanup tasks
 */

// Validate cron expression
const validateCronExpression = (expression) => {
  return cron.validate(expression);
};

// Schedule: Run daily at 2:00 AM
// Format: second minute hour day month weekday
// '0 2 * * *' = At 02:00 (2 AM) every day
const SCHEDULE = process.env.DATA_RETENTION_SCHEDULE || '0 2 * * *';

let scheduledTask = null;

/**
 * Start the data retention scheduler
 */
const startDataRetentionScheduler = () => {
  if (!validateCronExpression(SCHEDULE)) {
    console.error('❌ Invalid cron expression for data retention schedule:', SCHEDULE);
    return false;
  }

  if (scheduledTask) {
    console.warn('⚠️  Data retention scheduler is already running');
    return false;
  }

  scheduledTask = cron.schedule(SCHEDULE, async () => {
    console.log('🔄 Scheduled data retention policy execution starting...');
    await runDataRetentionPolicies();
  }, {
    scheduled: true,
    timezone: process.env.TZ || 'Europe/Berlin' // Default to Germany timezone
  });

  console.log(`✅ Data retention scheduler started`);
  console.log(`📅 Schedule: ${SCHEDULE} (${process.env.TZ || 'Europe/Berlin'})`);
  console.log(`💡 Next run: Daily at 2:00 AM`);
  
  return true;
};

/**
 * Stop the data retention scheduler
 */
const stopDataRetentionScheduler = () => {
  if (scheduledTask) {
    scheduledTask.stop();
    scheduledTask = null;
    console.log('✅ Data retention scheduler stopped');
    return true;
  }
  console.warn('⚠️  Data retention scheduler is not running');
  return false;
};

/**
 * Run data retention immediately (manual trigger)
 */
const runDataRetentionNow = async () => {
  console.log('🔄 Manual data retention execution triggered...');
  return await runDataRetentionPolicies();
};

/**
 * Get scheduler status
 */
const getSchedulerStatus = () => {
  return {
    isRunning: scheduledTask !== null,
    schedule: SCHEDULE,
    timezone: process.env.TZ || 'Europe/Berlin',
    nextRun: 'Daily at 2:00 AM'
  };
};

module.exports = {
  startDataRetentionScheduler,
  stopDataRetentionScheduler,
  runDataRetentionNow,
  getSchedulerStatus
};
