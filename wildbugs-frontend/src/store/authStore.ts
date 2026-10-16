import { create } from 'zustand';
import type { User } from '../types/auth';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
}

/**
 * Global authentication store powered by Zustand.
 * Security Note: Tokens are maintained in memory to protect against XSS token harvesting.
 */
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  setAuth: (user: User, token: string) => {
    set({
      user,
      token,
      isAuthenticated: true,
    });
  },
  setUser: (user: User) => {
    set({ user });
  },
  logout: () => {
    set({
      user: null,
      token: null,
      isAuthenticated: false,
    });
  },
}));

export default useAuthStore;
