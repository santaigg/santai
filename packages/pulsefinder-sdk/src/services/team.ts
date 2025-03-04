import { AxiosInstance } from 'axios';
import { ApiResponse, GetTeamsForClientV1Response, Team } from '@repo/pulsefinder-types';

/**
 * Service for interacting with team-related endpoints
 */
export class TeamService {
  private client: AxiosInstance;

  constructor(client: AxiosInstance) {
    this.client = client;
  }

  /**
   * Get team information
   * @param teamId The ID of the team to retrieve
   * @returns Promise with the team data
   */
  async getTeam(teamId: string, playerId: string): Promise<ApiResponse<GetTeamsForClientV1Response>> {
    const response = await this.client.get(`/v1/teams/${teamId}/player/${playerId}`);
    return response.data;
  }

  /**
   * Get team members
   * @param teamId The ID of the team
   * @returns Promise with the team members
   */
  async getTeamMembers(teamId: string, playerId: string): Promise<ApiResponse<Team>> {
    const response = await this.client.get(`/v1/teams/${teamId}/player/${playerId}/members`);
    return response.data;
  }

  /**
   * Get team stats
   * @param teamId The ID of the team
   * @returns Promise with the team stats
   */
  async getTeamStats(teamId: string, playerId: string): Promise<ApiResponse<any>> {
    const response = await this.client.get(`/v1/teams/${teamId}/player/${playerId}/stats`);
    return response.data;
  }

  /**
   * Get teams for players
   * @param playerIds Array of player IDs to get teams for
   * @returns Promise with the teams for the players
   */
  async getTeamsForPlayers(playerIds: string[]): Promise<ApiResponse<GetTeamsForClientV1Response>> {
    const response = await this.client.post('/v1/teams/by-players', {
      playerIds
    });
    return response.data;
  }
} 