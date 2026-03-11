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
  age?: number;
  dateOfBirth?: string;
  gender?: string;
  occupation?: string;
  education?: string;
  interests?: string[];
  phoneNumber?: string;
  socialMedia?: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    linkedin?: string;
  };
  lookingFor?: string[];
  relationshipStatus?: string;
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
  age?: number;
  dateOfBirth?: string;
  gender?: string;
  occupation?: string;
  education?: string;
  interests?: string[];
  phoneNumber?: string;
  socialMedia?: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    linkedin?: string;
  };
  lookingFor?: string[];
  relationshipStatus?: string;
  isVerified: boolean;
  likedBy?: string[];
  likesCount?: number;
  hostedEventsCount?: number;
  joinedEventsCount?: number;
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
    
    // api interceptor already returns response.data
    if (response.data?.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    } else {
      console.error('No token in response:', response);
    }
    return response as unknown as AuthResponse;
  }

  async login(data: LoginData): Promise<AuthResponse> {
    const response = await api.post('/auth/login', data);
    
    // api interceptor already returns response.data
    if (response.data?.token) {
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
