const Testimonial = require('../models/Testimonial');

// @desc    Get all approved testimonials
// @route   GET /api/testimonials
// @access  Public
exports.getTestimonials = async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;

    const testimonials = await Testimonial.find({ isApproved: true })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .exec();

    res.status(200).json({
      success: true,
      count: testimonials.length,
      data: testimonials
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new testimonial
// @route   POST /api/testimonials
// @access  Private
exports.createTestimonial = async (req, res, next) => {
  try {
    const { text } = req.body;

    // Check if user already submitted a testimonial
    const existingTestimonial = await Testimonial.findOne({ user: req.user._id });
    if (existingTestimonial) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a testimonial'
      });
    }

    const testimonial = await Testimonial.create({
      user: req.user._id,
      text
    });

    res.status(201).json({
      success: true,
      data: testimonial,
      message: 'Thank you for your feedback! Your testimonial will be reviewed before being published.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's own testimonial
// @route   GET /api/testimonials/my-testimonial
// @access  Private
exports.getMyTestimonial = async (req, res, next) => {
  try {
    const testimonial = await Testimonial.findOne({ user: req.user._id });

    res.status(200).json({
      success: true,
      data: testimonial
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user's own testimonial
// @route   PUT /api/testimonials/my-testimonial
// @access  Private
exports.updateMyTestimonial = async (req, res, next) => {
  try {
    const { text } = req.body;

    let testimonial = await Testimonial.findOne({ user: req.user._id });

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: 'No testimonial found'
      });
    }

    testimonial.text = text;
    testimonial.isApproved = false; // Reset approval status when edited
    await testimonial.save();

    res.status(200).json({
      success: true,
      data: testimonial,
      message: 'Your testimonial has been updated and will be reviewed again.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user's own testimonial
// @route   DELETE /api/testimonials/my-testimonial
// @access  Private
exports.deleteMyTestimonial = async (req, res, next) => {
  try {
    const testimonial = await Testimonial.findOne({ user: req.user._id });

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: 'No testimonial found'
      });
    }

    await testimonial.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Testimonial deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Admin only endpoints below

// @desc    Get all testimonials (including unapproved)
// @route   GET /api/testimonials/admin/all
// @access  Private/Admin
exports.getAllTestimonials = async (req, res, next) => {
  try {
    const testimonials = await Testimonial.find()
      .sort({ createdAt: -1 })
      .exec();

    res.status(200).json({
      success: true,
      count: testimonials.length,
      data: testimonials
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve testimonial
// @route   PUT /api/testimonials/admin/:id/approve
// @access  Private/Admin
exports.approveTestimonial = async (req, res, next) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: 'Testimonial not found'
      });
    }

    testimonial.isApproved = true;
    await testimonial.save();

    res.status(200).json({
      success: true,
      data: testimonial,
      message: 'Testimonial approved successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete any testimonial
// @route   DELETE /api/testimonials/admin/:id
// @access  Private/Admin
exports.deleteTestimonial = async (req, res, next) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: 'Testimonial not found'
      });
    }

    await testimonial.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Testimonial deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
