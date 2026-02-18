import api from './api';

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  city: string;
  languages: string[];
  avatar?: string;
  images?: string[];
  bio?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  avatar: string;
  images?: string[];
  bio: string;
  city: string;
  languages: string[];
  isVerified: boolean;
  createdAt: string;
  lastActive: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

class AuthService {
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post('/auth/register', data);
    console.log('Register response:', response);
    
    // api interceptor already returns response.data
    if (response.data?.token) {
      console.log('Saving token:', response.data.token);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    } else {
      console.error('No token in response:', response);
    }
    return response as unknown as AuthResponse;
  }

  async login(data: LoginData): Promise<AuthResponse> {
    const response = await api.post('/auth/login', data);
    console.log('Login response:', response);
    
    // api interceptor already returns response.data
    if (response.data?.token) {
      console.log('Saving token:', response.data.token);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    } else {
      console.error('No token in response:', response);
    }
    return response as unknown as AuthResponse;
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }

  async getMe(): Promise<User> {
    const response = await api.get('/auth/me');
    // api interceptor already returns response.data
    return response.data || response;
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await api.put('/auth/profile', data);
    // api interceptor already returns response.data
    const user = response.data || response;
    localStorage.setItem('user', JSON.stringify(user));
    return user;
  }

  async changePassword(currentPassword: string, newPassword: string) {
    return await api.put('/auth/password', { currentPassword, newPassword });
  }

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }
}

export default new AuthService();
