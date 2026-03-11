import api from './api';
import { User } from './authService';

class UserService {
  async getUserProfile(id: string): Promise<User> {
    const response = await api.get(`/users/${id}`);
    return response.data;
  }

  async searchUsers(params: {
    search?: string;
    city?: string;
    language?: string;
    page?: number;
    limit?: number;
  }) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) queryParams.append(key, value.toString());
    });
    
    return await api.get(`/users?${queryParams.toString()}`);
  }

  async likeUser(userId: string) {
    const response = await api.post(`/users/${userId}/like`);
    return response.data;
  }

  async unlikeUser(userId: string) {
    const response = await api.delete(`/users/${userId}/like`);
    return response.data;
  }
}

export default new UserService();
