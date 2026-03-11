/**
 * GDPR Data Migration Script
 * 
 * Purpose: Remove excessive personal data fields from existing users
 * Compliance: GDPR Article 5 (Data Minimization)
 * 
 * CRITICAL: Run this ONCE after deploying the updated User model
 * This script removes fields that are no longer in the schema:
 * - dateOfBirth (removed - only age needed for 18+ verification)
 * - phoneNumber (removed - PII risk, not essential)
 * - socialMedia (removed - identity theft risk)
 * - relationshipStatus (removed - discrimination risk)
 * - occupation (removed - not essential)
 * - education (removed - not essential)
 * - isVerified (removed - replaced with specific verification fields)
 * 
 * How to run:
 * 1. Ensure MongoDB connection is configured
 * 2. Run: node src/scripts/migrateUserData.js
 * 3. Verify output logs
 * 4. Mark this script as completed in deployment checklist
 */

require('dotenv').config();
const mongoose = require('mongoose');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected for migration');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const migrateUserData = async () => {
  try {
    console.log('🔄 Starting GDPR data migration...\n');

    // Get reference to users collection
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    // Count total users
    const totalUsers = await usersCollection.countDocuments();
    console.log(`📊 Total users to migrate: ${totalUsers}\n`);

    // Remove excessive fields from all users
    const result = await usersCollection.updateMany(
      {}, // All users
      {
        $unset: {
          dateOfBirth: '',
          phoneNumber: '',
          socialMedia: '',
          relationshipStatus: '',
          occupation: '',
          education: '',
          isVerified: ''
        }
      }
    );

    console.log(`✅ Migration completed successfully!`);
    console.log(`   - Users matched: ${result.matchedCount}`);
    console.log(`   - Users modified: ${result.modifiedCount}\n`);

    // Set default values for new fields (if not already set)
    const setDefaultsResult = await usersCollection.updateMany(
      { ageVerified: { $exists: false } },
      {
        $set: {
          ageVerified: false,
          isEmailVerified: false
        }
      }
    );

    console.log(`✅ Default values set for new fields:`);
    console.log(`   - Users updated: ${setDefaultsResult.modifiedCount}\n`);

    // Verify migration - check if any users still have old fields
    const usersWithOldFields = await usersCollection.countDocuments({
      $or: [
        { dateOfBirth: { $exists: true } },
        { phoneNumber: { $exists: true } },
        { socialMedia: { $exists: true } },
        { relationshipStatus: { $exists: true } },
        { occupation: { $exists: true } },
        { education: { $exists: true } },
        { isVerified: { $exists: true } }
      ]
    });

    if (usersWithOldFields > 0) {
      console.warn(`⚠️  WARNING: ${usersWithOldFields} users still have old fields!`);
    } else {
      console.log(`✅ Verification passed: No users have old fields\n`);
    }

    // Statistics
    const stats = {
      totalUsers,
      migrated: result.modifiedCount,
      defaultsSet: setDefaultsResult.modifiedCount,
      timestamp: new Date().toISOString()
    };

    console.log('📈 Migration Statistics:');
    console.log(JSON.stringify(stats, null, 2));

    mongoose.connection.close();
    console.log('\n✅ Database connection closed');
    console.log('🎉 Migration complete!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  }
};

// Run migration
connectDB().then(migrateUserData);
