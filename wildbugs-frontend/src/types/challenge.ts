export type ChallengeScope = 'INDIVIDUAL' | 'TEAM';

export type ChallengeStatus = 'UPCOMING' | 'ACTIVE' | 'ENDED';

export interface ChallengeCriteria {
  type: 'sightings_count' | 'unique_species' | 'family' | 'verified_count';
  target: number;
  family?: string;
  icon?: string;
}

export interface ChallengeUserProgress {
  joined: boolean;
  progress: number;
  target: number;
  percentage: number;
  completed: boolean;
  completedAt: string | null;
  joinedAt?: string | null;
}

export interface ChallengeItem {
  id: number;
  title: string;
  description: string;
  criteria: ChallengeCriteria;
  scope: ChallengeScope;
  startsAt: string;
  endsAt: string;
  createdAt: string;
  status: ChallengeStatus;
  daysLeft: number;
  participantCount: number;
  userProgress?: ChallengeUserProgress;
}
