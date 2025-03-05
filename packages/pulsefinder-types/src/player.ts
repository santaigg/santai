/**
 * Player profile data
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
 * Bulk profile request parameters
 */
export interface BulkProfileRequest {
  playerIds: string[];
}

export interface GetBulkProfileDataClientV1Response {
  sequenceNumber: number;
  response: {
    requestId: number;
    type: string;
    payload: BulkProfileResponse;
  }
}


/**
 * Bulk profile response
 */
export interface BulkProfileResponse {
  bulkProfileData: ProfileData[];
}

export interface ProfileData {
  playerId: string;
  displayName: {
    displayName: string;
    discriminator: string;
  };
  banner: {
    itemInstanceId: string;
    itemType: string;
    alterationData?: any;
    attachmentItemInstanceId?: string;
    itemCatalogId?: string;
    attachmentItemCatalogId?: string;
  };
  crewId?: string;
  crewScore?: string
  currentSoloRank?: number;
  highestTeamRank?: number;
  divisionType?: string;
}

/**
 * Platform types for searching players
 */
export enum Platform {
  DISCORD = "discord",
  STEAM = "steam",
  TWITCH = "twitch"
}

/**
 * Search by platform request parameters
 */
export interface SearchByPlatformRequest {
  platform: Platform;
  accountId: string;
}

/**
 * Search by platform response
 */
export interface SearchByPlatformResponse {
  success: boolean;
  message?: string;
  data?: any; // We keep this as any to avoid exposing internal types
} 

export interface GetPlayerIdentitiesByProviderAccountIdsV1Response {
  sequenceNumber: number;
  response: {
    requestId: number;
    type: string;
    payload: {
      playerIdentities: PlayerIdentity[];
    };
  }
}

export interface PlayerIdentity {
  pragmaPlayerId: string;
  pragmaDisplayName: {
    displayName: string;
    discriminator: string;
  };
  idProviderAccounts: ProviderAccount[];
  pragmaSocialId: string;
}

export interface ProviderAccount {
  idProviderType: string;
  accountId: string;
  providerDisplayName: {
    displayName: string;
    discriminator: string;
  };
}
