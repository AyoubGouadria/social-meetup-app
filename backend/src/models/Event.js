const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
    minlength: [3, 'Title must be at least 3 characters'],
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    minlength: [10, 'Description must be at least 10 characters'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  category: {
    type: String,
    required: true,
    trim: true,
    minlength: [3, 'Category must be at least 3 characters'],
    maxlength: [30, 'Category cannot exceed 30 characters']
  },
  date: {
    type: Date,
    required: [true, 'Event date is required'],
    validate: {
      validator: function(value) {
        return value > Date.now();
      },
      message: 'Event date must be in the future'
    }
  },
  time: {
    type: String,
    required: [true, 'Event time is required']
  },
  location: {
    type: String,
    required: [true, 'Location is required']
  },
  locationCoords: {
    lat: {
      type: Number,
      required: false
    },
    lng: {
      type: Number,
      required: false
    }
  },
  maxParticipants: {
    type: Number,
    required: true,
    min: [2, 'Must allow at least 2 participants'],
    max: [50, 'Cannot exceed 50 participants']
  },
  languages: [{
    type: String,
    required: true
  }],
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  participants: {
    type: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    default: []
  },
  status: {
    type: String,
    enum: ['published', 'cancelled', 'completed'],
    default: 'published'
  },
  imageUrl: {
    type: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for current participants count
eventSchema.virtual('currentParticipants').get(function() {
  if (!this.participants) {
    return 1; // Just the host
  }
  return this.participants.length + 1; // +1 for host
});

// Virtual for distance (calculated in controller based on user location)
eventSchema.virtual('distance').get(function() {
  return this._distance || 0;
});

// Index for location-based queries
eventSchema.index({ location: 'text', title: 'text', description: 'text' });
eventSchema.index({ date: 1, status: 1 });
eventSchema.index({ host: 1 });
eventSchema.index({ category: 1 });

// Automatically add host to participants when event is created
eventSchema.pre('save', function(next) {
  // Initialize participants array if undefined
  if (!this.participants) {
    this.participants = [];
  }
  
  if (this.isNew && !this.participants.includes(this.host)) {
    this.participants.push(this.host);
  }
  next();
});

module.exports = mongoose.model('Event', eventSchema);
