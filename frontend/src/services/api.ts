import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// CSRF token storage (in-memory, not localStorage for security)
let csrfToken: string | null = null;

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Required for CSRF cookies
});

// Initialize CSRF token on app load
export const initializeCsrf = async (): Promise<void> => {
  try {
    const response = await axios.get(`${API_BASE_URL.replace('/api', '')}/api/csrf-token`, {
      withCredentials: true,
    });
    csrfToken = response.data.csrfToken;
  } catch (error) {
    console.error('Failed to fetch CSRF token:', error);
  }
};

// Request interceptor - Add auth token and CSRF token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add CSRF token to state-changing requests
    if (csrfToken && ['post', 'put', 'patch', 'delete'].includes(config.method?.toLowerCase() || '')) {
      config.headers['X-CSRF-Token'] = csrfToken;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    // If CSRF token invalid, try to refresh it
    if (error.response?.status === 403 && error.response?.data?.code === 'EBADCSRFTOKEN') {
      initializeCsrf();
    }
    
    return Promise.reject(error.response?.data || error);
  }
);

export default api;
