export interface StreakDay {
  date: string;
  dayLabel: string;
  hasSighting: boolean;
}

export interface UserStats {
  totalSightings: number;
  uniqueSpecies: number;
  verifiedCount: number;
  accuracyRate: number;
  currentStreak: number;
  longestStreak: number;
  last7Days: StreakDay[];
}

export interface UserProfile {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  role: string;
  createdAt: string;
  email?: string;
}

export interface UserProfileData {
  user: UserProfile;
  stats: UserStats;
}

export interface JournalSpecies {
  id: number;
  commonName: string;
  scientificName: string;
  family: string;
  imageUrl: string;
  conservationStatus: string;
}

export interface JournalIdentification {
  id: string;
  source: 'AI' | 'USER' | 'EXPERT';
  confidence: number;
  isAccepted: boolean;
  species: {
    id: number;
    commonName: string;
    scientificName: string;
  };
}

export interface JournalSighting {
  id: string;
  photoUrl: string;
  thumbnailUrl: string | null;
  latitude: number;
  longitude: number;
  aiConfidence: number | null;
  status: 'PENDING' | 'IDENTIFIED' | 'VERIFIED' | 'REJECTED';
  observedAt: string;
  createdAt: string;
  species: JournalSpecies | null;
  identifications?: JournalIdentification[];
}

export interface JournalPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

export interface FieldJournalResponse {
  user: {
    id: string;
    displayName: string;
    avatarUrl: string | null;
  };
  sightings: JournalSighting[];
  pagination: JournalPagination;
}

export type LeaderboardMetric = 'sightings' | 'species' | 'verified';

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  score: number;
  metric: LeaderboardMetric;
}

export interface LeaderboardResponse {
  metric: LeaderboardMetric;
  rankings: LeaderboardEntry[];
  cached?: boolean;
}
