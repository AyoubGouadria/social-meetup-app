import api from './api';

export interface Testimonial {
  _id: string;
  user: {
    _id: string;
    name: string;
    avatar: string;
  };
  text: string;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
}

class TestimonialService {
  async getTestimonials(limit = 10) {
    return await api.get(`/testimonials?limit=${limit}`);
  }

  async createTestimonial(text: string) {
    return await api.post('/testimonials', { text });
  }

  async getMyTestimonial() {
    return await api.get('/testimonials/my-testimonial');
  }

  async updateMyTestimonial(text: string) {
    return await api.put('/testimonials/my-testimonial', { text });
  }

  async deleteMyTestimonial() {
    return await api.delete('/testimonials/my-testimonial');
  }
}

export default new TestimonialService();
