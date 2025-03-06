// Match module types

export interface MatchPlayer {
  crewId: string;
  numKills: number;
  playerId: string;
  crewScore: number;
  numDeaths: number;
  divisionId: string;
  idProvider: string;
  numAssists: number;
  divisionType: number;
  currentRankId: number;
  teammateIndex: number;
  crewScoreDelta: number;
  previousRankId: number;
  savedPlayerName: string;
  selectedSponsor: {
    tagName: string;
  };
  totalDamageDone: number;
  nativePlatformId: string;
  numRankedMatches: number;
  savedSponsorName: string;
  isAnonymousPlayer: boolean;
  rankedRatingDelta: number;
  hasCrewScoreEarned: boolean;
  matchPlacementData: string[];
  currentRankedRating: number;
  previousRankedRating: number;
  selectedBannerCatalogId: string;
}

export interface MatchTeam {
  teamId: string;
  roundsWon: number;
  playerData: MatchPlayer[];
  xpPerRound: number;
  fansPerRound: number;
  roundsPlayed: number;
  bUsedTeamRank: boolean;
  currentRankId: number;
  xpPerRoundWon: number;
  previousRankId: number;
  bpXpPerRoundWon: number;
  fansPerRoundWon: number;
  numRankedMatches: number;
  rankedRatingDelta: number;
  bIsFullTeamInParty: boolean;
  bpXpPerRoundPlayed: number;
  matchPlacementData: string[];
  currentRankedRating: number;
  previousRankedRating: number;
}

export interface Match {
  matchId: string;
  teamData: MatchTeam[];
  bIsRanked: boolean;
  queueName: string;
  overtimeType: string;
  queueGameMap: string;
  queueGameMode: string;
  surrenderedTeam: number;
  bIsAbandonedMatch: boolean;
  customMatchRegion: string;
  abandonedPlayerIds: string[];
  bMatchCanceledForCheating: boolean;
  created_at?: string;
  updated_at?: string | null;
}

export interface MatchSummary {
  matchId: string;
  queueGameMap: string;
  queueGameMode: string;
  bIsRanked: boolean;
  winningTeamId: string;
  created_at: string;
  teamData: {
    teamId: string;
    roundsWon: number;
    playerNames: string[];
  }[];
} 