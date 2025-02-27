import { AxiosInstance } from 'axios';
import { 
  ApiResponse, 
  Match, 
  NotFoundError,
  PlayerMatchHistoryRequest,
  TeamMatchHistoryRequest
} from '../types';

/**
 * Service for match-related API calls
 */
export class MatchService {
  private client: AxiosInstance;

  /**
   * Create a new MatchService
   * @param client Authenticated Axios client
   */
  constructor(client: AxiosInstance) {
    this.client = client;
  }

  /**
   * Get match details by match ID
   * @param matchId The match's unique ID
   * @returns Promise with the match details
   */
  async getMatchDetails(matchId: string): Promise<Match> {
    try {
      const response = await this.client.get<ApiResponse<Match>>(`/matches/${matchId}`);
      
      if (!response.data.success || !response.data.data) {
        throw new NotFoundError(`Match with ID ${matchId} not found`);
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
   * Get match history for a player
   * @param playerId The player's unique ID
   * @param startIndex Optional starting index for pagination
   * @param count Optional number of matches to return
   * @returns Promise with an array of matches
   */
  async getPlayerMatchHistory(
    playerId: string, 
    startIndex: number = 0, 
    count: number = 10
  ): Promise<Match[]> {
    try {
      const request: PlayerMatchHistoryRequest = { 
        playerId, 
        startIndex, 
        count 
      };
      
      const response = await this.client.post<ApiResponse<Match[]>>('/matches/player', request);
      
      if (!response.data.success || !response.data.data) {
        throw new Error(`Failed to fetch match history for player ${playerId}`);
      }
      
      return response.data.data;
    } catch (error) {
      // Handle errors or rethrow
      throw error;
    }
  }

  /**
   * Get match history for a team
   * @param teamId The team's unique ID
   * @param startIndex Optional starting index for pagination
   * @param count Optional number of matches to return
   * @returns Promise with an array of matches
   */
  async getTeamMatchHistory(
    teamId: string, 
    startIndex: number = 0, 
    count: number = 10
  ): Promise<Match[]> {
    try {
      const request: TeamMatchHistoryRequest = { 
        teamId, 
        startIndex, 
        count 
      };
      
      const response = await this.client.post<ApiResponse<Match[]>>('/matches/team', request);
      
      if (!response.data.success || !response.data.data) {
        throw new Error(`Failed to fetch match history for team ${teamId}`);
      }
      
      return response.data.data;
    } catch (error) {
      // Handle errors or rethrow
      throw error;
    }
  }
} 