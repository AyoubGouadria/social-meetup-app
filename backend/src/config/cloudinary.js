const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadImage = async (file, folder = 'meetly') => {
  try {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: folder,
      resource_type: 'auto',
      transformation: [
        { width: 800, height: 800, crop: 'limit' },
        { quality: 'auto:good' }
      ]
    });

    return {
      url: result.secure_url,
      publicId: result.public_id
    };
  } catch (error) {
    throw new Error('Image upload failed: ' + error.message);
  }
};

const deleteImage = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Image deletion failed:', error);
  }
};

/**
 * Delete multiple images from Cloudinary
 * Used for GDPR account deletion
 * @param {Array} publicIds - Array of Cloudinary public IDs
 */
const deleteMultipleImages = async (publicIds) => {
  try {
    if (!publicIds || publicIds.length === 0) {
      return;
    }

    // Cloudinary supports batch deletion
    const result = await cloudinary.api.delete_resources(publicIds, {
      resource_type: 'image'
    });

    console.log(`Deleted ${publicIds.length} images from Cloudinary`);
    return result;
  } catch (error) {
    console.error('Batch image deletion failed:', error);
    // Don't throw error - allow account deletion to continue even if images fail
  }
};

/**
 * Extract Cloudinary public IDs from image URLs
 * @param {Array} urls - Array of Cloudinary URLs
 * @returns {Array} Array of public IDs
 */
const extractPublicIds = (urls) => {
  if (!urls || urls.length === 0) return [];
  
  return urls
    .filter(url => url && typeof url === 'string' && url.includes('cloudinary'))
    .map(url => {
      // Extract public ID from Cloudinary URL
      // URL format: https://res.cloudinary.com/cloud-name/image/upload/v1234567/folder/public-id.jpg
      const parts = url.split('/');
      const uploadIndex = parts.indexOf('upload');
      if (uploadIndex !== -1 && parts[uploadIndex + 2]) {
        // Get folder/filename part and remove file extension
        const fullPath = parts.slice(uploadIndex + 2).join('/');
        return fullPath.replace(/\.[^/.]+$/, ''); // Remove extension
      }
      return null;
    })
    .filter(id => id !== null);
};

module.exports = {
  uploadImage,
  deleteImage,
  deleteMultipleImages,
  extractPublicIds
};
