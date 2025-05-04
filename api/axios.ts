import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create axios instance with base URL
const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || 'https://api.nyimpang.com',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Add request interceptor
api.interceptors.request.use(
  async (config) => {
    // Get token from storage
    const token = await AsyncStorage.getItem('nyimpang_token');
    
    // Add token to headers if it exists
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Handle token refresh on 401 errors
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Attempt to refresh token (implement token refresh logic here)
        const refreshToken = await AsyncStorage.getItem('nyimpang_refresh_token');
        if (!refreshToken) {
          // No refresh token, redirect to login
          throw new Error('No refresh token');
        }
        
        // Call token refresh endpoint
        const response = await axios.post(
          `${process.env.EXPO_PUBLIC_API_URL}/auth/refresh-token`,
          { refreshToken }
        );
        
        const { token } = response.data;
        
        // Update token in storage
        await AsyncStorage.setItem('nyimpang_token', token);
        
        // Update Authorization header
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        originalRequest.headers['Authorization'] = `Bearer ${token}`;
        
        // Retry original request
        return api(originalRequest);
      } catch (refreshError) {
        // Handle refresh failure - clear tokens and redirect to login
        await AsyncStorage.removeItem('nyimpang_token');
        await AsyncStorage.removeItem('nyimpang_refresh_token');
        
        // Return the original error
        return Promise.reject(error);
      }
    }
    
    // Add specific error handling based on error status codes
    if (error.response) {
      // Server responded with error status
      switch (error.response.status) {
        case 400:
          // Bad request handling
          break;
        case 403:
          // Forbidden handling
          break;
        case 404:
          // Not found handling
          break;
        case 500:
          // Server error handling
          break;
        default:
          break;
      }
      
      // Return response error data if available
      return Promise.reject(
        error.response.data || {
          message: 'An error occurred with the request',
        }
      );
    } else if (error.request) {
      // Request was made but no response received (network error)
      return Promise.reject({
        message: 'Network error. Please check your internet connection.',
      });
    } else {
      // Error setting up request
      return Promise.reject({
        message: 'Request error. Please try again.',
      });
    }
  }
);

export default api;