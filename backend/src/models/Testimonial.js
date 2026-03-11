const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: [true, 'Testimonial text is required'],
    trim: true,
    minlength: [10, 'Testimonial must be at least 10 characters'],
    maxlength: [500, 'Testimonial cannot exceed 500 characters']
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Populate user info when querying
testimonialSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'user',
    select: 'name avatar'
  });
  next();
});

module.exports = mongoose.model('Testimonial', testimonialSchema);
