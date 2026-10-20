import apiClient from './client';
import type { ChallengeItem, ChallengeUserProgress } from '../types/challenge';

export const challengesApi = {
  /**
   * Fetch all active and seasonal challenges, annotated with user progress if logged in
   */
  async getChallenges(): Promise<ChallengeItem[]> {
    const response = await apiClient.get<{ status: string; data: ChallengeItem[] }>(
      '/challenges'
    );
    return response.data.data;
  },

  /**
   * Fetch detailed information for a single challenge
   */
  async getChallenge(id: number): Promise<ChallengeItem> {
    const response = await apiClient.get<{ status: string; data: ChallengeItem }>(
      `/challenges/${id}`
    );
    return response.data.data;
  },

  /**
   * Enroll the authenticated naturalist into a seasonal challenge
   */
  async joinChallenge(id: number): Promise<ChallengeUserProgress> {
    const response = await apiClient.post<{ status: string; data: ChallengeUserProgress }>(
      `/challenges/${id}/join`
    );
    return response.data.data;
  },

  /**
   * Fetch the current authenticated user's progress for a challenge
   */
  async getChallengeProgress(id: number): Promise<ChallengeUserProgress> {
    const response = await apiClient.get<{ status: string; data: ChallengeUserProgress }>(
      `/challenges/${id}/progress`
    );
    return response.data.data;
  },
};

export default challengesApi;
