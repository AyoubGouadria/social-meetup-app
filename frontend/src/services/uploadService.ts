import api from './api';

class UploadService {
  /**
   * Upload image file to server (Cloudinary)
   * @param file - Image file to upload
   * @returns Promise with image URL
   */
  async uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await api.post('/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // api interceptor returns response.data, so response is already the data object
      // response = { success: true, message: '...', data: { url: '...', publicId: '...' } }
      return response.data.url;
    } catch (error: any) {
      console.error('Upload error:', error);
      throw new Error(error.message || 'Failed to upload image');
    }
  }

  /**
   * Upload multiple image files to server (Cloudinary)
   * @param files - Array of image files to upload
   * @returns Promise with array of image URLs
   */
  async uploadImages(files: File[]): Promise<string[]> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });

    try {
      const response = await api.post('/upload/images', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // response.data.images = [{ url: '...', publicId: '...' }, ...]
      return response.data.images.map((img: any) => img.url);
    } catch (error: any) {
      console.error('Upload error:', error);
      throw new Error(error.message || 'Failed to upload images');
    }
  }
}

const uploadService = new UploadService();
export default uploadService;
