import axios, { type AxiosInstance } from 'axios';
import { useAuthStore } from '../store/authStore';
import { toast } from '../store/toastStore';

const API_BASE_URL: string = import.meta.env?.VITE_API_URL || 'http://localhost:3001/api';

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request Interceptor: Attach JWT Bearer token from memory store
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Standardized error logging, automatic redirects, and tiered toast notices
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const serverMessage = error.response?.data?.message;

    if (status === 401) {
      // Auto logout on 401 Unauthorized
      const wasLoggedIn = Boolean(useAuthStore.getState().token);
      useAuthStore.getState().logout();

      if (wasLoggedIn && typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        toast.warning('Session expired. Please log in to continue.');
        window.location.href = '/login';
      }
    } else if (status === 429) {
      // 429 Rate limit exceeded
      toast.error(serverMessage || 'Too many requests. Please slow down and try again later.');
    } else if (status >= 500) {
      // 500 Internal server error
      toast.error('Something went wrong on the server. Please try again later.');
    }

    const message = serverMessage || error.message || 'API Request Failed';
    console.error(`[API Error] ${error.config?.method?.toUpperCase()} ${error.config?.url}:`, message);

    return Promise.reject(error);
  }
);

export default apiClient;
