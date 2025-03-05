import { AxiosInstance } from 'axios';
import { ApiResponse, PlayerIdentity, ProfileData } from '@repo/pulsefinder-types';

/**
 * Service for interacting with player-related endpoints
 */
export class PlayerService {
  private client: AxiosInstance;

  constructor(client: AxiosInstance) {
    this.client = client;
  }

  /**
   * Get player profiles in bulk
   * @param playerIds Array of player IDs to retrieve
   * @returns Promise with the player profiles
   */
  async getBulkProfiles(playerIds: string[]): Promise<ApiResponse<ProfileData[]>> {
    const response = await this.client.post('/v1/players/profiles/bulk', {
      playerIds
    });
    return response.data;
  }

  /**
   * Search for a player by platform
   * @param platform The platform to search on (e.g., 'steam', 'discord', 'twitch')
   * @param accountId The account ID on the platform
   * @returns Promise with the player profile
   */
  async searchByPlatform(platform: string, accountId: string): Promise<ApiResponse<PlayerIdentity>> {
    const response = await this.client.post('/v1/players/search-by-platform', {
      platform,
      accountId
    });
    return response.data;
  }

  /**
   * Get player stats
   * @param playerId The ID of the player
   * @returns Promise with the player stats
   */
  async getPlayerStats(playerId: string): Promise<ApiResponse<any>> {
    const response = await this.client.get(`/v1/players/${playerId}/stats`);
    return response.data;
  }

  // /**
  //  * Get player social connections (Discord, Steam, Twitch, etc.)
  //  * @param playerId The ID of the player
  //  * @returns Promise with the player's social connections
  //  */
  // async getSocialConnections(playerId: string): Promise<ApiResponse<any>> {
  //   const response = await this.client.get(`/v1/players/${playerId}/social-connections`);
  //   return response.data;
  // }

  // /**
  //  * Get player teams
  //  * @param playerId The ID of the player
  //  * @returns Promise with the player's teams
  //  */
  // async getPlayerTeams(playerId: string): Promise<ApiResponse<any>> {
  //   const response = await this.client.get(`/v1/players/${playerId}/teams`);
  //   return response.data;
  // }
} 