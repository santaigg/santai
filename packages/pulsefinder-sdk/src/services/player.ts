import { AxiosInstance } from 'axios';
import { 
  ApiResponse, 
  BulkProfileRequest, 
  Platform, 
  PlayerProfile, 
  SearchByPlatformRequest,
  NotFoundError
} from '../types';

/**
 * Service for player-related API calls
 */
export class PlayerService {
  private client: AxiosInstance;

  /**
   * Create a new PlayerService
   * @param client Authenticated Axios client
   */
  constructor(client: AxiosInstance) {
    this.client = client;
  }

  /**
   * Get a player profile by ID
   * @param playerId The player's unique ID
   * @returns Promise with the player profile
   */
  async getPlayerProfile(playerId: string): Promise<PlayerProfile> {
    try {
      const response = await this.client.get<ApiResponse<PlayerProfile>>(`/players/${playerId}`);
      
      if (!response.data.success || !response.data.data) {
        throw new NotFoundError(`Player with ID ${playerId} not found`);
      }
      
      return response.data.data;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      
      // Handle other errors or rethrow
      throw error;
    }
  }

  /**
   * Get multiple player profiles by IDs
   * @param playerIds Array of player IDs
   * @returns Promise with an array of player profiles
   */
  async getBulkProfiles(playerIds: string[]): Promise<PlayerProfile[]> {
    try {
      const request: BulkProfileRequest = { playerIds };
      const response = await this.client.post<ApiResponse<PlayerProfile[]>>('/players/bulk', request);
      
      if (!response.data.success || !response.data.data) {
        throw new Error('Failed to fetch bulk profiles');
      }
      
      return response.data.data;
    } catch (error) {
      // Handle errors or rethrow
      throw error;
    }
  }

  /**
   * Search for a player by platform account ID
   * @param platform The platform (Discord, Steam, Twitch)
   * @param accountId The platform-specific account ID
   * @returns Promise with the player profile
   */
  async searchByPlatform(platform: Platform, accountId: string): Promise<PlayerProfile> {
    try {
      const request: SearchByPlatformRequest = { platform, accountId };
      const response = await this.client.post<ApiResponse<PlayerProfile>>('/players/search/platform', request);
      
      if (!response.data.success || !response.data.data) {
        throw new NotFoundError(`Player with ${platform} account ID ${accountId} not found`);
      }
      
      return response.data.data;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      
      // Handle other errors or rethrow
      throw error;
    }
  }
} 