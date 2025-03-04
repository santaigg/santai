/**
 * Team data structure
 */
export interface Team {
  teamId: string;
  playerIds: string[];
  teamData: string;
  casualMmr: number;
  rankedMmr: number;
  teamRankPoints: number;
  casualMatchesPlayedCount: number;
  rankedMatchesPlayedCount: number;
  casualMatchesPlayedSeasonCount: number;
  rankedMatchesPlayedSeasonCount: number;
  rankedPlacementMatches: any[]; // This could be more specific if we know the structure
  currentTeamRank: number;
  lastPlayed: string;
  teamName: string;
  teamSize: number;
  updatedDate: string;
  createdDate: string;
}

/**
 * Request parameters for GetTeamsForClientV1
 */
export interface GetTeamsForClientV1Request {
  playerIds?: string[];
  teamIds?: string[];
}

/**
 * Response for GetTeamsForClientV1
 */
export interface GetTeamsForClientV1Response {
  teams: Team[];
}

/**
 * RPC request wrapper
 */
export interface MtnTeamServiceRpcRequest {
  type: string;
  payload: GetTeamsForClientV1Request;
  hostType: string;
  skipHealthCheck: boolean;
}

/**
 * RPC response wrapper
 */
export interface MtnTeamServiceRpcResponse {
    sequenceNumber: number;
    response: {
        requestId: number;
        type: string;
        payload: GetTeamsForClientV1Response;
    }
}
