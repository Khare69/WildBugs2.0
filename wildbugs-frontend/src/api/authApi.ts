import apiClient from './client';
import type { AuthResponse, MeResponse } from '../types/auth';

export const authApi = {
  /**
   * Registers a new account.
   */
  register: async (email: string, password: string, displayName: string): Promise<AuthResponse['data']> => {
    const response = await apiClient.post<AuthResponse>('/auth/register', {
      email,
      password,
      displayName,
    });
    return response.data.data;
  },

  /**
   * Authenticates user with credentials.
   */
  login: async (email: string, password: string): Promise<AuthResponse['data']> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', {
      email,
      password,
    });
    return response.data.data;
  },

  /**
   * Retrieves current authenticated user profile and stats.
   */
  getMe: async (): Promise<MeResponse['data']> => {
    const response = await apiClient.get<MeResponse>('/auth/me');
    return response.data.data;
  },
};

export default authApi;
