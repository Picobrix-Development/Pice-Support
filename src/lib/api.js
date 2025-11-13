import axios from 'axios';

// Get API URL from environment variables
const getApiUrl = () => {
  // Check if running in browser (not SSR)
  if (typeof window !== 'undefined') {
    // Check if running in local development mode
    const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

    if (isDevelopment) {
      // Local development - use local backend
      // Default to Live backend for public pages
      return 'http://localhost:8002/api/v1';
    }
  }

  // Production or SSR - use Azure Live API URL
  return import.meta.env.VITE_LIVE_API_URL || 'https://pice-console-live-api.azurewebsites.net/api/v1';
};

// Create axios instance with baseURL
const api = axios.create({
  baseURL: getApiUrl(),
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 45000  // 45 seconds for external API calls
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;
