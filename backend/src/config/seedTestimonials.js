const mongoose = require('mongoose');
const Testimonial = require('../models/Testimonial');
const User = require('../models/User');
require('dotenv').config();

const seedTestimonials = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/meetly');
    console.log('Connected to MongoDB');

    // Find some existing users to use for testimonials
    const users = await User.find().limit(3);
    
    if (users.length < 3) {
      console.log('Not enough users in database. Please create at least 3 users first.');
      process.exit(1);
    }

    // Delete existing testimonials
    await Testimonial.deleteMany({});
    console.log('Cleared existing testimonials');

    // Create sample testimonials
    const testimonials = [
      {
        user: users[0]._id,
        text: "I moved to Berlin 3 months ago and this app helped me find my friend group! The events are well-organized and everyone is so welcoming.",
        isApproved: true
      },
      {
        user: users[1]._id,
        text: "Great way to practice German and meet locals. The coffee meetups are my favorite! Highly recommend for anyone new to the city.",
        isApproved: true
      },
      {
        user: users[2]._id,
        text: "Found study partners and coffee buddies. The community is so welcoming and diverse. I've made lifelong friends through this app!",
        isApproved: true
      }
    ];

    await Testimonial.insertMany(testimonials);
    console.log('✅ Successfully seeded 3 approved testimonials');

    mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding testimonials:', error);
    process.exit(1);
  }
};

seedTestimonials();
