const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getTestimonials,
  createTestimonial,
  getMyTestimonial,
  updateMyTestimonial,
  deleteMyTestimonial,
  getAllTestimonials,
  approveTestimonial,
  deleteTestimonial
} = require('../controllers/testimonialController');

// Public routes
router.get('/', getTestimonials);

// Protected routes - User
router.post('/', protect, createTestimonial);
router.get('/my-testimonial', protect, getMyTestimonial);
router.put('/my-testimonial', protect, updateMyTestimonial);
router.delete('/my-testimonial', protect, deleteMyTestimonial);

// Admin routes (for future admin implementation)
// router.get('/admin/all', protect, isAdmin, getAllTestimonials);
// router.put('/admin/:id/approve', protect, isAdmin, approveTestimonial);
// router.delete('/admin/:id', protect, isAdmin, deleteTestimonial);

module.exports = router;
