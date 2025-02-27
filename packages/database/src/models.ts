// Domain models for the application
// These models represent the business entities in a format optimized for application use

export interface Player {
  id: string
  displayName: string
  discriminator: string
  createdAt: Date
  updatedAt: Date | null
  
  // Related entities
  crew?: Crew | null
  stats?: PlayerStats | null
  banner?: PlayerBanner | null
  accounts?: PlayerAccount[]
  teams?: TeamMembership[]
  matches?: MatchPlayer[]
}

export interface Crew {
  id: string
  name: string
  homeTurf: string | null
  totalScore: number
  divisionId: string | null
  division?: Division | null
}

export interface Division {
  id: string
  name: string
  type: string
}

export interface PlayerStats {
  currentSoloRank: number
  highestTeamRank: number
  rankRating: number | null
  lastUpdatedRankRating: Date | null
}

export interface PlayerBanner {
  itemInstanceId: string
  itemCatalogId: string | null
  itemType: string
  alterationData?: any | null
  attachmentItemInstanceId?: string | null
  attachmentItemCatalogId?: string | null
}

export interface PlayerAccount {
  id: string
  accountId: string
  displayName: string
  providerType: string
}

export interface TeamMembership {
  id: string
  team: Team
}

export interface Team {
  id: string
  teamName: string
  teamSize: number
  teamData: any | null
  lastPlayed: Date | null
}

export interface MatchPlayer {
  id: number
  savedPlayerName: string
  savedSponsorName: string
  selectedSponsor: string
  selectedBannerCatalogId: string
  numKills: number
  numDeaths: number
  numAssists: number
  totalDamageDeone: number
  currentRankId: number
  previousRankId: number
  currentRankedRating: number
  previousRankedRating: number
  numRankedMatches: number
  isAnonymousPlayer: boolean
  teammateIndex: number
  crewScore: number
  team: MatchTeam
}

export interface MatchTeam {
  id: string
  teamIndex: number
  roundsPlayed: number
  roundsWon: number
  isFullTeamInParty: boolean
  usedTeamRank: boolean
  xpPerRound: number
  xpPerRoundWon: number
  match: Match
}

export interface Match {
  id: string
  matchDate: Date | null
  isRanked: boolean
  isAbandonedMatch: boolean
  queueName: string | null
  queueGameMode: string | null
  queueGameMap: string | null
  region: string | null
  surrenderedTeam: number | null
} 