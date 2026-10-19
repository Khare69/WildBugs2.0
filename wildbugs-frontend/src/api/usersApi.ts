import apiClient from './client';
import type {
  UserProfileData,
  FieldJournalResponse,
  LeaderboardResponse,
  LeaderboardMetric,
  UserBadgeItem,
} from '../types/user';

export const usersApi = {
  /**
   * Fetch authenticated observer's profile details and discovery stats
   */
  async getMyProfile(): Promise<UserProfileData> {
    const response = await apiClient.get<{ status: string; data: UserProfileData }>('/users/me');
    return response.data.data;
  },

  /**
   * Fetch public profile details and discovery stats for any user ID
   */
  async getUserProfile(userId: string): Promise<UserProfileData> {
    const response = await apiClient.get<{ status: string; data: UserProfileData }>(`/users/${userId}`);
    return response.data.data;
  },

  /**
   * Fetch paginated chronological field journal sightings for a user
   */
  async getFieldJournal(userId: string, page = 1, limit = 10): Promise<FieldJournalResponse> {
    const response = await apiClient.get<{ status: string; data: FieldJournalResponse }>(
      `/users/${userId}/journal`,
      {
        params: { page, limit },
      }
    );
    return response.data.data;
  },

  /**
   * Fetch top naturalists ranked across sightings, species, or verified records
   */
  async getLeaderboard(
    metric: LeaderboardMetric = 'sightings',
    limit = 10
  ): Promise<LeaderboardResponse> {
    const response = await apiClient.get<{ status: string; data: LeaderboardResponse }>(
      '/users/leaderboard',
      {
        params: { metric, limit },
      }
    );
    return response.data.data;
  },

  /**
   * Fetch all platform achievement badges annotated with user's earned status and progress
   */
  async getUserBadges(userId: string): Promise<UserBadgeItem[]> {
    const response = await apiClient.get<{ status: string; data: UserBadgeItem[] }>(
      `/users/${userId}/badges`
    );
    return response.data.data;
  },
};

export default usersApi;
