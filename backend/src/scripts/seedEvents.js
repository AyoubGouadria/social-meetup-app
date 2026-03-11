require('dotenv').config();
const mongoose = require('mongoose');
const Event = require('../models/Event');
const User = require('../models/User');

const sampleEvents = [
  {
    title: "Coffee Chat at Starbucks",
    description: "Let's meet for a relaxing coffee chat! Perfect opportunity to practice languages and make new friends. All levels welcome!",
    category: "coffee",
    date: new Date('2026-03-15T10:00:00'),
    time: "10:00",
    location: "Starbucks, Alexanderplatz, Berlin",
    locationCoords: { lat: 52.5219, lng: 13.4132 },
    maxParticipants: 5,
    languages: ["English", "German"]
  },
  {
    title: "Morning Walk in Tiergarten",
    description: "Join us for a refreshing morning walk through the beautiful Tiergarten park. Great way to start your day and meet active people!",
    category: "walk",
    date: new Date('2026-03-14T08:00:00'),
    time: "08:00",
    location: "Tiergarten Park, Main Entrance, Berlin",
    locationCoords: { lat: 52.5144, lng: 13.3501 },
    maxParticipants: 8,
    languages: ["English", "German", "Spanish"]
  },
  {
    title: "Study Group - German Language",
    description: "Preparing for German B2 exam? Let's study together at the library. Bring your materials and let's help each other improve!",
    category: "study",
    date: new Date('2026-03-16T14:00:00'),
    time: "14:00",
    location: "Berlin Central Library, Mitte",
    locationCoords: { lat: 52.5200, lng: 13.4050 },
    maxParticipants: 6,
    languages: ["German", "English"]
  },
  {
    title: "Gym Workout Session",
    description: "Looking for a workout buddy? Join us for a strength training session. All fitness levels welcome. Let's motivate each other!",
    category: "gym",
    date: new Date('2026-03-18T18:00:00'),
    time: "18:00",
    location: "FitnessFabrik, Kreuzberg, Berlin",
    locationCoords: { lat: 52.4987, lng: 13.4015 },
    maxParticipants: 4,
    languages: ["English", "German"]
  },
  {
    title: "Explore Berlin Street Art",
    description: "Let's discover the amazing street art scene in Berlin! We'll walk through different neighborhoods and take lots of photos. Art lovers welcome!",
    category: "explore",
    date: new Date('2026-03-17T15:00:00'),
    time: "15:00",
    location: "East Side Gallery, Friedrichshain, Berlin",
    locationCoords: { lat: 52.5058, lng: 13.4394 },
    maxParticipants: 10,
    languages: ["English", "German", "Spanish", "French"]
  },
  {
    title: "Board Games Evening",
    description: "Love board games? Join us for a fun evening of strategy games and socializing. We have Catan, Ticket to Ride, and more!",
    category: "Gaming",
    date: new Date('2026-03-19T19:00:00'),
    time: "19:00",
    location: "Brettspielplatz Café, Prenzlauer Berg, Berlin",
    locationCoords: { lat: 52.5407, lng: 13.4164 },
    maxParticipants: 6,
    languages: ["English", "German"]
  },
  {
    title: "Brunch at Markthalle Neun",
    description: "Let's enjoy delicious food and great conversation at one of Berlin's best food markets. Vegetarian and vegan options available!",
    category: "coffee",
    date: new Date('2026-03-20T11:00:00'),
    time: "11:00",
    location: "Markthalle Neun, Kreuzberg, Berlin",
    locationCoords: { lat: 52.4977, lng: 13.4324 },
    maxParticipants: 8,
    languages: ["English", "German", "Spanish"]
  },
  {
    title: "Photography Walk Around Spree River",
    description: "Calling all photography enthusiasts! Let's capture the beauty of Berlin along the Spree River. Bring your camera or smartphone!",
    category: "Photography",
    date: new Date('2026-03-21T16:00:00'),
    time: "16:00",
    location: "Museum Island, Mitte, Berlin",
    locationCoords: { lat: 52.5186, lng: 13.3978 },
    maxParticipants: 7,
    languages: ["English", "German", "French"]
  },
  {
    title: "Yoga in the Park",
    description: "Join us for an outdoor yoga session! All levels welcome. Bring your own mat. Weather permitting - check for updates!",
    category: "gym",
    date: new Date('2026-03-22T09:00:00'),
    time: "09:00",
    location: "Tempelhofer Feld, Berlin",
    locationCoords: { lat: 52.4764, lng: 13.4045 },
    maxParticipants: 12,
    languages: ["English", "German"]
  },
  {
    title: "Cooking Class - Italian Pasta",
    description: "Learn to make authentic Italian pasta from scratch! Fun, delicious, and social. No experience needed, just bring your appetite!",
    category: "Cooking",
    date: new Date('2026-03-23T17:00:00'),
    time: "17:00",
    location: "Community Kitchen, Neukölln, Berlin",
    locationCoords: { lat: 52.4816, lng: 13.4275 },
    maxParticipants: 8,
    languages: ["English", "German", "Turkish"]
  }
];

const seedEvents = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/meetly');
    console.log('Connected to MongoDB');

    // Find the first user to be the host (or create a demo user)
    let hostUser = await User.findOne();
    
    if (!hostUser) {
      console.log('No users found. Creating a demo user...');
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      hostUser = await User.create({
        name: 'Demo Host',
        email: 'demo@meetly.com',
        password: hashedPassword,
        city: 'Berlin',
        languages: ['English', 'German'],
        birthdate: new Date('1995-01-01'),
        gender: 'other',
        interests: ['Travel', 'Technology', 'Sports']
      });
      console.log('Demo user created!');
    }

    // Clear existing events (optional - comment out if you want to keep existing events)
    // await Event.deleteMany({});
    // console.log('Cleared existing events');

    // Create events
    const eventsToCreate = sampleEvents.map(event => ({
      ...event,
      host: hostUser._id,
      participants: [],
      status: 'published'
    }));

    const createdEvents = await Event.insertMany(eventsToCreate);
    console.log(`✅ Successfully created ${createdEvents.length} sample events!`);

    console.log('\nSample Events Created:');
    createdEvents.forEach((event, index) => {
      console.log(`${index + 1}. ${event.title} - ${event.category} - ${event.date.toLocaleDateString()}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error seeding events:', error);
    process.exit(1);
  }
};

seedEvents();
