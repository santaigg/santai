import { AxiosInstance } from 'axios';
import { ApiResponse } from '../types';

/**
 * Service for interacting with stats-related endpoints
 */
export class StatsService {
  private client: AxiosInstance;

  constructor(client: AxiosInstance) {
    this.client = client;
  }

  /**
   * Make a generic RPC call to the game API
   * @param type The RPC type
   * @param payload The payload for the RPC call
   * @param hostType The host type (game or social)
   * @param accountId Optional specific account ID to use
   * @returns Promise with the RPC response
   */
  async makeGenericRpcCall(
    type: string, 
    payload: any, 
    hostType: "game" | "social" = "game", 
    accountId?: string
  ): Promise<ApiResponse<any>> {
    const response = await this.client.post('/v1/generic', {
      type,
      payload,
      hostType,
      ...(accountId ? { accountId } : {})
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

  /**
   * Get team stats
   * @param teamId The ID of the team
   * @returns Promise with the team stats
   */
  async getTeamStats(teamId: string): Promise<ApiResponse<any>> {
    const response = await this.client.get(`/v1/teams/${teamId}/stats`);
    return response.data;
  }

  /**
   * Get leaderboard data
   * @param leaderboardId The ID of the leaderboard
   * @param startRank The starting rank
   * @param count The number of entries to retrieve
   * @returns Promise with the leaderboard data
   */
  async getLeaderboard(
    leaderboardId: string,
    startRank: number = 1,
    count: number = 100
  ): Promise<ApiResponse<any>> {
    const response = await this.client.get(`/v1/leaderboards/${leaderboardId}`, {
      params: { startRank, count }
    });
    return response.data;
  }

  /**
   * Get player rank on a leaderboard
   * @param leaderboardId The ID of the leaderboard
   * @param playerId The ID of the player
   * @returns Promise with the player's rank data
   */
  async getPlayerLeaderboardRank(
    leaderboardId: string,
    playerId: string
  ): Promise<ApiResponse<any>> {
    const response = await this.client.get(`/v1/leaderboards/${leaderboardId}/player/${playerId}`);
    return response.data;
  }
} 