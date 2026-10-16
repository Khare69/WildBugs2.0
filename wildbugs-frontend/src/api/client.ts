import axios, { type AxiosInstance } from 'axios';

const API_BASE_URL: string = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request Interceptor: Attach JWT token if stored
apiClient.interceptors.request.use(
  (config) => {
    // Token is retrieved from memory/store in later sub-phases
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Standardized error logging
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || 'API Request Failed';
    console.error(`[API Error] ${error.config?.method?.toUpperCase()} ${error.config?.url}:`, message);
    return Promise.reject(error);
  }
);

export default apiClient;
