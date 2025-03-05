/**
 * Match data response from the game API
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
 * Match history request parameters
 */
export interface MatchHistoryRequest {
  matchId: string;
}

/**
 * Player match history request parameters
 */
export interface PlayerMatchHistoryRequest {
  playerId: string;
  startIndex?: number;
  count?: number;
}

/**
 * Team match history request parameters
 */
export interface TeamMatchHistoryRequest {
  teamId: string;
  startIndex?: number;
  count?: number;
}

export interface GetMatchHistoryByMatchIdClientV1Response {
  sequenceNumber: number;
  response: {
    requestId: number;
    type: string
    payload: {
      matchData: {
        matchId: string;
        matchData: string;
        matchDate: string;
      }
    }
  }
}

export interface GetMatchHistoryByTeamClientV1Response {
  sequenceNumber: number;
  response: {
    requestId: number;
    type: string;
    payload: {
      matchData: {
        matchId: string;
        matchData: string;
        matchDate: string;
      }[]
    }
  }
}

/**
 * Match history response
 */
export interface MatchHistoryResponse {
  success: boolean;
  message?: string;
  data?: {
    matchId: string;
    queueName: string;
    queueGameMode: string;
    queueGameMap: string;
    region: string;
    isRanked: boolean;
    isAbandonedMatch: boolean;
    surrenderedTeam?: number;
    matchDate: string;
    teams: Array<{
      teamIndex: number;
      roundsWon: number;
      roundsPlayed: number;
      currentRankId?: number;
      previousRankId?: number;
      currentRankedRating?: number;
      previousRankedRating?: number;
      rankedRatingDelta?: number;
      players: Array<{
        playerId: string;
        numKills: number;
        numDeaths: number;
        numAssists: number;
        totalDamageDone: number;
        crewId?: string;
        divisionId?: string;
      }>;
    }>;
  };
} 