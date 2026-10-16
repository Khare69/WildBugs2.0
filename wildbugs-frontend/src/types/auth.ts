export type UserRole = 'USER' | 'EXPERT' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  role: UserRole;
  createdAt: string;
}

export interface AuthResponse {
  status: 'success' | 'fail' | 'error';
  message: string;
  data: {
    user: User;
    token: string;
  };
}

export interface MeResponse {
  status: 'success' | 'fail' | 'error';
  data: {
    user: User;
    stats: {
      sightingsCount: number;
      identificationsCount: number;
      badgesCount: number;
    };
  };
}
