import axios from 'axios';
import { getRestaurantId } from '@/context/RestaurantContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

// Create axios instance with default config
export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Prefer restaurant_id from localStorage (set by AuthContext on login)
    let restaurantId = localStorage.getItem('restaurant_id');
    
    // If no restaurant_id in localStorage, try to get from stored restaurant object
    if (!restaurantId) {
      restaurantId = getRestaurantId?.();
    }
    
    if (restaurantId) {
      config.headers['X-Restaurant-Id'] = restaurantId;
    } else {
      console.warn('⚠️ API Request without restaurant context:', config.url);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already retried, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const { data } = await axios.post(`${API_URL}/auth/refresh`, {
            refreshToken,
          });

          localStorage.setItem('auth_token', data.data.token);
          apiClient.defaults.headers.Authorization = `Bearer ${data.data.token}`;
          originalRequest.headers.Authorization = `Bearer ${data.data.token}`;

          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/manager/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
