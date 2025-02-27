/**
 * PulseFinder SDK Types
 * For internal use within the monorepo
 */

// Authentication types
export interface AuthConfig {
  apiKey?: string;
  baseUrl?: string;
}

export interface AuthResponse {
  token: string;
  expiresAt: number;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

// Player types
export enum Platform {
  DISCORD = "discord",
  STEAM = "steam",
  TWITCH = "twitch"
}

export interface SearchByPlatformRequest {
  platform: Platform;
  accountId: string;
}

export interface PlayerProfile {
  playerId: string;
  displayName: string;
  avatarUrl?: string;
  level?: number;
  createdAt?: string;
  lastSeenAt?: string;
  // Add other player profile fields as needed
}

export interface BulkProfileRequest {
  playerIds: string[];
}

// Match types
export interface MatchHistoryRequest {
  matchId: string;
}

export interface PlayerMatchHistoryRequest {
  playerId: string;
  startIndex?: number;
  count?: number;
}

export interface TeamMatchHistoryRequest {
  teamId: string;
  startIndex?: number;
  count?: number;
}

export interface MatchPlayer {
  playerId: string;
  numKills: number;
  numDeaths: number;
  numAssists: number;
  totalDamageDone: number;
  crewId?: string;
  divisionId?: string;
}

export interface MatchTeam {
  teamIndex: number;
  roundsWon: number;
  roundsPlayed: number;
  currentRankId?: number;
  previousRankId?: number;
  currentRankedRating?: number;
  previousRankedRating?: number;
  rankedRatingDelta?: number;
  players: MatchPlayer[];
}

export interface Match {
  matchId: string;
  queueName: string;
  queueGameMode: string;
  queueGameMap: string;
  region: string;
  isRanked: boolean;
  isAbandonedMatch: boolean;
  surrenderedTeam?: number;
  matchDate: string;
  teams: MatchTeam[];
}

// Error types
export class PulseFinderError extends Error {
  statusCode?: number;
  
  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = 'PulseFinderError';
    this.statusCode = statusCode;
  }
}

export class AuthenticationError extends PulseFinderError {
  constructor(message: string = 'Authentication failed') {
    super(message, 401);
    this.name = 'AuthenticationError';
  }
}

export class NotFoundError extends PulseFinderError {
  constructor(message: string = 'Resource not found') {
    super(message, 404);
    this.name = 'NotFoundError';
  }
} 