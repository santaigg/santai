import { AxiosInstance } from 'axios';
import { ApiResponse, MatchData } from '@repo/pulsefinder-types';

/**
 * Service for interacting with match-related endpoints
 */
export class MatchService {
  private client: AxiosInstance;

  constructor(client: AxiosInstance) {
    this.client = client;
  }

  /**
   * Get match by ID
   * @param matchId The ID of the match to retrieve
   * @returns Promise with the match data
   */
  async getMatch(matchId: string): Promise<ApiResponse<MatchData>> {
    const response = await this.client.get(`/v1/matches/${matchId}`);
    return response.data;
  }

  /**
   * Get match history for a player
   * @param playerId The ID of the player
   * @param startIndex Optional starting index for pagination
   * @param count Optional number of matches to retrieve
   * @returns Promise with the player's match history
   */
  async getPlayerMatchHistory(
    playerId: string, 
    startIndex: number = 0, 
    count: number = 20
  ): Promise<ApiResponse<MatchData[]>> {
    const response = await this.client.get(`/v1/matches/player/${playerId}`, {
      params: { startIndex, count }
    });
    return response.data;
  }

  /**
   * Get match history for a team
   * @param teamId The ID of the team
   * @param startIndex Optional starting index for pagination
   * @param count Optional number of matches to retrieve
   * @returns Promise with the team's match history
   */
  async getTeamMatchHistory(
    teamId: string,
    startIndex: number = 0,
    count: number = 20
  ): Promise<ApiResponse<MatchData[]>> {
    const response = await this.client.get(`/v1/matches/team/${teamId}`, {
      params: { startIndex, count }
    });
    return response.data;
  }

  /**
   * Check if a player or team has new matches
   * @param entityId The ID of the player or team
   * @param entityType The type of entity ('player' or 'team')
   * @returns Promise with a boolean indicating if there are new matches
   */
  async hasNewMatches(
    entityId: string,
    entityType: 'player' | 'team'
  ): Promise<ApiResponse<boolean>> {
    const response = await this.client.get(`/v1/matches/${entityType}/${entityId}/has-new`);
    return response.data;
  }
} 