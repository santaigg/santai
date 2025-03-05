import { AxiosInstance } from 'axios';
import { ApiResponse, Team, TeamRoster } from '@repo/pulsefinder-types';

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
   * @param playerId The ID of a player in the team
   * @returns Promise with the team data
   */
  async getTeam(teamId: string, playerId: string): Promise<ApiResponse<Team>> {
    const response = await this.client.get(`/v1/teams/${teamId}/${playerId}`);
    return response.data;
  }

  /**
   * Get team members
   * @param teamId The ID of the team
   * @returns Promise with the team members
   */
  async getTeamMembers(teamId: string): Promise<ApiResponse<TeamRoster>> {
    const response = await this.client.get(`/v1/teams/${teamId}/members`);
    return response.data;
  }

  /**
   * Get team stats
   * @param playerId The ID of a player to get team stats for
   * @returns Promise with the team stats
   */
  async getTeamStats(playerId: string): Promise<ApiResponse<Team>> {
    const response = await this.client.get(`/v1/teams/${playerId}/stats`);
    return response.data;
  }

  /**
   * Get teams for players
   * @param playerIds Array of player IDs to get teams for
   * @returns Promise with the teams for the players
   */
  async getTeamsForPlayers(playerIds: string[]): Promise<ApiResponse<Team[]>> {
    const response = await this.client.post('/v1/teams/by-players', {
      playerIds
    });
    return response.data;
  }
} 