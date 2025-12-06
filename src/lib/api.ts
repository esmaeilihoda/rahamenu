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
    console.log('[API] REQUEST:', config.url);
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('[API] Added auth token');
    }
    // Prefer restaurant_id from localStorage (set by AuthContext on login)
    let restaurantId = localStorage.getItem('restaurant_id');
    console.log('[API] Step 1 - localStorage restaurant_id:', restaurantId);
    
    // If no restaurant_id in localStorage, try to get from stored restaurant object
    if (!restaurantId) {
      restaurantId = getRestaurantId?.();
      console.log('[API] Step 2 - getRestaurantId():', restaurantId);
    }
    
    // If still no restaurant ID, try to extract from URL path (for customer pages)
    if (!restaurantId) {
      const urlPath = window.location.pathname;
      const pathSegments = urlPath.split('/').filter(Boolean);
      console.log('[API] Step 3 - URL path:', urlPath);
      console.log('[API] Step 3 - Path segments:', pathSegments);
      if (pathSegments.length > 0 && pathSegments[0] !== 'manager' && pathSegments[0] !== 'kitchen') {
        // The first path segment is likely the restaurant slug (e.g., /demo-cafe/customer)
        restaurantId = pathSegments[0];
        console.log('[API] Step 3 - Extracted restaurant slug from URL:', restaurantId);
      }
    }
    
    if (restaurantId) {
      config.headers['X-Restaurant-Id'] = restaurantId;
      console.log('[API] FINAL - X-Restaurant-Id set to:', restaurantId);
      localStorage.setItem('_api_debug', JSON.stringify({ 
        event: 'request_sent',
        url: config.url,
        restaurantId: restaurantId,
        headers: { 'X-Restaurant-Id': restaurantId },
        timestamp: new Date().toISOString() 
      }));
    } else {
      console.error('[API] ERROR - No restaurant context found!');
      localStorage.setItem('_api_debug', JSON.stringify({ 
        event: 'no_restaurant_id', 
        url: config.url,
        pathname: typeof window !== 'undefined' ? window.location.pathname : 'N/A',
        pathSegments: typeof window !== 'undefined' ? window.location.pathname.split('/').filter(Boolean) : [],
        timestamp: new Date().toISOString() 
      }));
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
    console.error('[API] RESPONSE ERROR:', error.response?.status, error.message);
    localStorage.setItem('_api_debug', JSON.stringify({ 
      event: 'api_error',
      status: error.response?.status,
      message: error.message,
      url: error.config?.url,
      headers: error.config?.headers,
      timestamp: new Date().toISOString() 
    }));

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
