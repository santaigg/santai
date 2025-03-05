/**
 * Authentication configuration for the PulseFinder SDK
 */
export interface AuthConfig {
  /**
   * API key for authentication
   * If not provided, will use PULSEFINDER_API_KEY environment variable
   */
  apiKey?: string;
  
  /**
   * Base URL for the PulseFinder API
   * If not provided, will use PULSEFINDER_API_URL environment variable or default to http://localhost:3000
   */
  baseUrl?: string;
}

/**
 * Authentication error
 */
export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

/**
 * Response format for API calls
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Player profile
 */
export interface PlayerProfile {
  id: string;
  name: string;
  discriminator?: string;
  crewId?: string;
  banner?: {
    itemInstanceId: string;
    itemType: string;
    alterationData?: any;
    attachmentItemInstanceId?: string;
    itemCatalogId?: string;
    attachmentItemCatalogId?: string;
  };
  stats?: {
    currentSoloRank?: number;
    highestTeamRank?: number;
    rankRating?: number;
    lastUpdatedRankRating?: string;
  };
  socialConnections?: {
    discord?: string;
    steam?: string;
    twitch?: string;
  };
}

/**
 * Match data
 */
export interface MatchData {
  matchId: string;
  queueName: string;
  queueGameMode: string;
  queueGameMap: string;
  overtimeType: string;
  region: string;
  bIsRanked: boolean;
  bIsAbandonedMatch: boolean;
  abandonedPlayerIds: string[];
  surrenderedTeam: number;
  teamData: MatchTeamData[];
}

/**
 * Match team data
 */
export interface MatchTeamData {
  roundsPlayed: number;
  roundsWon: number;
  xpPerRound: number;
  xpPerRoundWon: number;
  teamId: string;
  currentRankId: number;
  previousRankId: number;
  currentRankedRating: number;
  previousRankedRating: number;
  rankedRatingDelta: number;
  matchPlacementData: string[];
  numRankedMatches: number;
  fansPerRound: number;
  fansPerRoundWon: number;
  playerData: MatchPlayerData[];
  bUsedTeamRank: boolean;
  bIsFullTeamInParty: boolean;
}

/**
 * Match player data
 */
export interface MatchPlayerData {
  playerId: string;
  nativePlatformId: string;
  savedPlayerName: string;
  selectedBannerCatalogId: string;
  savedSponsorName: string;
  selectedSponsor: {
    tagName: string;
  };
  isAnonymousPlayer: boolean;
  hasCrewScoreEarned: boolean;
  teammateIndex: number;
  numKills: number;
  numAssists: number;
  numDeaths: number;
  totalDamageDone: number;
  currentRankId: number;
  previousRankId: number;
  currentRankedRating: number;
  previousRankedRating: number;
  rankedRatingDelta: number;
  crewScore: number;
  crewId: string;
  divisionId: string;
  divisionType: number;
  matchPlacementData: string[];
  numRankedMatches: number;
}

/**
 * Team data
 */
export interface TeamData {
  id: string;
  name: string;
  teamSize: number;
  createdDate: string;
  updatedDate: string;
  lastPlayed?: string;
  members: TeamMember[];
  stats?: TeamStats;
}

/**
 * Team member data
 */
export interface TeamMember {
  playerId: string;
  playerName?: string;
}

/**
 * Team stats data
 */
export interface TeamStats {
  casualMmr?: number;
  rankedMmr?: number;
  teamRankPoints?: number;
  casualMatchesPlayedCount?: number;
  rankedMatchesPlayedCount?: number;
  casualMatchesPlayedSeasonCount?: number;
  rankedMatchesPlayedSeasonCount?: number;
  currentTeamRank?: number;
}

/**
 * Crew data
 */
export interface CrewData {
  id: string;
  name: string;
  tag: string;
  description?: string;
  createdDate: string;
  updatedDate: string;
  members: CrewMember[];
  stats?: CrewStats;
}

/**
 * Crew member data
 */
export interface CrewMember {
  playerId: string;
  playerName?: string;
  role: 'owner' | 'admin' | 'member';
  joinedDate: string;
}

/**
 * Crew stats data
 */
export interface CrewStats {
  memberCount: number;
  totalWins?: number;
  totalMatches?: number;
}

/**
 * Division data
 */
export interface DivisionData {
  id: string;
  name: string;
  description?: string;
  createdDate: string;
  updatedDate: string;
  members: DivisionMember[];
  stats?: DivisionStats;
}

/**
 * Division member data
 */
export interface DivisionMember {
  playerId: string;
  playerName?: string;
  role: 'owner' | 'admin' | 'member';
  joinedDate: string;
}

/**
 * Division stats data
 */
export interface DivisionStats {
  memberCount: number;
  totalWins?: number;
  totalMatches?: number;
}

// Re-export team types from pulsefinder-types
export type { 
  Team, 
  GetTeamsForClientV1Request, 
  GetTeamsForClientV1Response,
  MtnTeamServiceRpcRequest,
  MtnTeamServiceRpcResponse
} from '@repo/pulsefinder-types';

// Re-export match types from pulsefinder-types
export type {
  MatchHistoryRequest,
  PlayerMatchHistoryRequest,
  TeamMatchHistoryRequest,
  GetMatchHistoryByMatchIdClientV1Response,
  GetMatchHistoryByTeamClientV1Response
} from '@repo/pulsefinder-types';
