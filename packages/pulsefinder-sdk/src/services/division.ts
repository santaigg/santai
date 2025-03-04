import { AxiosInstance } from 'axios';
import { ApiResponse } from '../types';

/**
 * Service for interacting with division-related endpoints
 */
export class DivisionService {
  private client: AxiosInstance;

  constructor(client: AxiosInstance) {
    this.client = client;
  }

  /**
   * Get division information
   * @param divisionId The ID of the division to retrieve
   * @returns Promise with the division data
   */
  async getDivision(divisionId: string): Promise<ApiResponse<any>> {
    const response = await this.client.get(`/v1/divisions/${divisionId}`);
    return response.data;
  }

  /**
   * Get teams in a division
   * @param divisionId The ID of the division
   * @returns Promise with the division teams
   */
  async getDivisionTeams(divisionId: string): Promise<ApiResponse<any>> {
    const response = await this.client.get(`/v1/divisions/${divisionId}/teams`);
    return response.data;
  }

  /**
   * Get division standings
   * @param divisionId The ID of the division
   * @returns Promise with the division standings
   */
  async getDivisionStandings(divisionId: string): Promise<ApiResponse<any>> {
    const response = await this.client.get(`/v1/divisions/${divisionId}/standings`);
    return response.data;
  }

  /**
   * Get player's divisions
   * @param playerId The ID of the player
   * @returns Promise with the player's divisions
   */
  async getPlayerDivisions(playerId: string): Promise<ApiResponse<any>> {
    const response = await this.client.get(`/v1/divisions/player/${playerId}`);
    return response.data;
  }
} 