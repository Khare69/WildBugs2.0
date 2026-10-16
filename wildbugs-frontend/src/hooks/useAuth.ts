import { useCallback } from 'react';
import { useAuthStore } from '../store/authStore';
import authApi from '../api/authApi';
import type { User } from '../types/auth';

export const useAuth = () => {
  const { user, token, isAuthenticated, setAuth, logout } = useAuthStore();

  const login = useCallback(
    async (email: string, password: string): Promise<User> => {
      const data = await authApi.login(email, password);
      setAuth(data.user, data.token);
      return data.user;
    },
    [setAuth]
  );

  const register = useCallback(
    async (email: string, password: string, displayName: string): Promise<User> => {
      const data = await authApi.register(email, password, displayName);
      setAuth(data.user, data.token);
      return data.user;
    },
    [setAuth]
  );

  return {
    user,
    token,
    isAuthenticated,
    login,
    register,
    logout,
  };
};

export default useAuth;
