import { AxiosInstance } from 'axios';
import { ApiResponse } from '../types';
import type { CrewData, CrewPlayer } from '@repo/pulsefinder-types';

/**
 * Service for interacting with crew-related endpoints
 */
export class CrewService {
  private client: AxiosInstance;

  constructor(client: AxiosInstance) {
    this.client = client;
  }

  /**
   * Get crew information
   * @param crewId The ID of the crew to retrieve
   * @returns Promise with the crew data
   */
  async getCrew(crewId: string): Promise<ApiResponse<CrewData>> {
    const response = await this.client.get(`/v1/crews/${crewId}`);
    return response.data;
  }

  /**
   * Get crew members
   * @param crewId The ID of the crew
   * @returns Promise with the crew members
   */
  async getCrewMembers(crewId: string): Promise<ApiResponse<CrewPlayer[]>> {
    const response = await this.client.get(`/v1/crews/${crewId}/members`);
    return response.data;
  }

  /**
   * Get crew stats
   * @param crewId The ID of the crew
   * @returns Promise with the crew stats
   */
  async getCrewStats(crewId: string): Promise<ApiResponse<CrewData>> {
    const response = await this.client.get(`/v1/crews/${crewId}/stats`);
    return response.data;
  }

  /**
   * Get player's crew
   * @param playerId The ID of the player
   * @returns Promise with the player's crew
   */
  async getPlayerCrew(playerId: string): Promise<ApiResponse<CrewData>> {
    const response = await this.client.get(`/v1/players/${playerId}/crew`);
    return response.data;
  }
} 