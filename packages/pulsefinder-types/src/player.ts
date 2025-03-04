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

/**
 * Bulk profile response
 */
export interface BulkProfileResponse {
  success: boolean;
  message?: string;
  data?: any; // We keep this as any to avoid exposing internal types
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