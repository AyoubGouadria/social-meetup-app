const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { uploadImage } = require('../config/cloudinary');
const { protect } = require('../middleware/auth');
const fs = require('fs').promises;

// @desc    Upload image
// @route   POST /api/upload/image
// @access  Private (Protected - requires authentication)
router.post('/image', protect, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    // Upload to Cloudinary
    const result = await uploadImage(req.file, 'meetly/avatars');

    // Delete temporary file
    await fs.unlink(req.file.path);

    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        url: result.url,
        publicId: result.publicId
      }
    });
  } catch (error) {
    // Clean up file if it exists
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting file:', unlinkError);
      }
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Image upload failed'
    });
  }
});

// @desc    Upload multiple images
// @route   POST /api/upload/images
// @access  Private (Protected - requires authentication)
router.post('/images', protect, upload.array('images', 6), async (req, res) => {
  const uploadedFiles = [];
  
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No image files provided'
      });
    }

    // Upload all images to Cloudinary
    for (const file of req.files) {
      const result = await uploadImage(file, 'meetly/avatars');
      uploadedFiles.push({
        url: result.url,
        publicId: result.publicId
      });
      
      // Delete temporary file
      await fs.unlink(file.path);
    }

    res.status(200).json({
      success: true,
      message: 'Images uploaded successfully',
      data: {
        images: uploadedFiles
      }
    });
  } catch (error) {
    // Clean up any uploaded files
    if (req.files) {
      for (const file of req.files) {
        try {
          await fs.unlink(file.path);
        } catch (unlinkError) {
          console.error('Error deleting file:', unlinkError);
        }
      }
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Images upload failed'
    });
  }
});

module.exports = router;
