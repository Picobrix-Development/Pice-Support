import axios from 'axios';

// Get environment from URL parameter or localStorage
const getEnvironment = () => {
  if (typeof window === 'undefined') return 'live';

  // Check URL parameter first
  const urlParams = new URLSearchParams(window.location.search);
  const envParam = urlParams.get('env');

  // If env parameter exists, save to localStorage and use it
  if (envParam) {
    localStorage.setItem('pice_env', envParam);
    return envParam;
  }

  // Otherwise, use localStorage or default to 'live'
  return localStorage.getItem('pice_env') || 'live';
};

// Get API URL based on environment
const getApiUrl = (env) => {
  const isTestEnv = env === 'test' || env === 'local' || env === 'dev';

  // Check if running in local development mode
  if (typeof window !== 'undefined') {
    const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

    if (isDevelopment) {
      // Local development - use appropriate backend port
      return isTestEnv ? 'http://localhost:8001/api/v1' : 'http://localhost:8002/api/v1';
    }
  }

  // Production - use appropriate Azure API URL
  if (isTestEnv) {
    return import.meta.env.VITE_TEST_API_URL || 'https://pice-console-test-api.azurewebsites.net/api/v1';
  }
  return import.meta.env.VITE_LIVE_API_URL || 'https://pice-console-live-api.azurewebsites.net/api/v1';
};

// Create axios instance
const api = axios.create({
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 45000  // 45 seconds for external API calls
});

// Request interceptor to dynamically set baseURL based on current environment
api.interceptors.request.use(
  (config) => {
    const env = getEnvironment();
    config.baseURL = getApiUrl(env);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Helper function to get current environment
export const getCurrentEnvironment = () => getEnvironment();

export default api;
