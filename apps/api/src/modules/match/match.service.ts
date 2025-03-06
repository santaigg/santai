import { Database } from "../../services/database";
import { Redis } from "../../services/redis";
import { Match, MatchSummary } from "./match.types";

export class MatchService {
  private static instance: MatchService;
  private db: Database;
  private redis: Redis;

  private constructor() {
    this.db = Database.getInstance();
    this.redis = Redis.getInstance();
  }

  public static getInstance(): MatchService {
    if (!MatchService.instance) {
      MatchService.instance = new MatchService();
    }
    return MatchService.instance;
  }

  /**
   * Add a new match to the database
   */
  public async addMatch(matchData: Match): Promise<{ matchId: string } | { error: string }> {
    try {
      // Store the match in the database
      const { data, error } = await this.db.client
        .from("spectre_match")
        .insert({
          id: matchData.matchId,
          match_data: matchData,
          is_ranked: matchData.bIsRanked,
          game_map: matchData.queueGameMap,
          game_mode: matchData.queueGameMode,
          created_at: new Date().toISOString()
        })
        .select("id")
        .single();

      if (error) {
        console.error("Error adding match:", error);
        return { error: error.message };
      }

      // Process player stats for each player in the match
      for (const team of matchData.teamData) {
        for (const player of team.playerData) {
          const otherTeam = matchData.teamData.find(t => t.teamId !== team.teamId);
          const otherTeamRoundsWon = otherTeam ? otherTeam.roundsWon : 0;
          
          await this.processPlayerStats(player.playerId, {
            matchId: matchData.matchId,
            teamId: team.teamId,
            won: team.roundsWon > otherTeamRoundsWon,
            kills: player.numKills,
            deaths: player.numDeaths,
            assists: player.numAssists,
            mmrChange: player.rankedRatingDelta,
            currentMmr: player.currentRankedRating
          });
        }
      }

      // Cache match summary in Redis for quick access
      const winningTeam = matchData.teamData.reduce((prev, current) => 
        (prev.roundsWon > current.roundsWon) ? prev : current
      );

      const matchSummary: MatchSummary = {
        matchId: matchData.matchId,
        queueGameMap: matchData.queueGameMap,
        queueGameMode: matchData.queueGameMode,
        bIsRanked: matchData.bIsRanked,
        winningTeamId: winningTeam.teamId,
        created_at: new Date().toISOString(),
        teamData: matchData.teamData.map(team => ({
          teamId: team.teamId,
          roundsWon: team.roundsWon,
          playerNames: team.playerData.map(player => player.savedPlayerName)
        }))
      };

      await this.redis.client.set(`match:${matchData.matchId}:summary`, JSON.stringify(matchSummary), {
        ex: 60 * 60 * 24 * 7 // Cache for 7 days
      });

      return { matchId: data.id };
    } catch (err) {
      console.error("Error in addMatch:", err);
      return { error: "Failed to add match" };
    }
  }

  /**
   * Get a match by ID
   */
  public async getMatch(matchId: string): Promise<Match | { error: string }> {
    try {
      // Try to get from Redis cache first
      const cachedMatch = await this.redis.client.get(`match:${matchId}`);
      if (cachedMatch) {
        return JSON.parse(cachedMatch as string);
      }

      // If not in cache, get from database
      const { data, error } = await this.db.client
        .from("spectre_match")
        .select("match_data")
        .eq("id", matchId)
        .single();

      if (error) {
        return { error: error.message };
      }

      if (!data) {
        return { error: "Match not found" };
      }

      // Cache the result for future requests
      await this.redis.client.set(`match:${matchId}`, JSON.stringify(data.match_data), {
        ex: 60 * 60 * 24 // Cache for 24 hours
      });

      return data.match_data as Match;
    } catch (err) {
      console.error("Error in getMatch:", err);
      return { error: "Failed to get match" };
    }
  }

  /**
   * Get a match summary by ID
   */
  public async getMatchSummary(matchId: string): Promise<MatchSummary | { error: string }> {
    try {
      // Try to get from Redis cache first
      const cachedSummary = await this.redis.client.get(`match:${matchId}:summary`);
      if (cachedSummary) {
        return JSON.parse(cachedSummary as string);
      }

      // If not in cache, get full match and create summary
      const matchResult = await this.getMatch(matchId);
      if ('error' in matchResult) {
        return matchResult;
      }

      const match = matchResult as Match;
      const winningTeam = match.teamData.reduce((prev, current) => 
        (prev.roundsWon > current.roundsWon) ? prev : current
      );

      const summary: MatchSummary = {
        matchId: match.matchId,
        queueGameMap: match.queueGameMap,
        queueGameMode: match.queueGameMode,
        bIsRanked: match.bIsRanked,
        winningTeamId: winningTeam.teamId,
        created_at: match.created_at || new Date().toISOString(),
        teamData: match.teamData.map(team => ({
          teamId: team.teamId,
          roundsWon: team.roundsWon,
          playerNames: team.playerData.map(player => player.savedPlayerName)
        }))
      };

      // Cache the summary
      await this.redis.client.set(`match:${matchId}:summary`, JSON.stringify(summary), {
        ex: 60 * 60 * 24 * 7 // Cache for 7 days
      });

      return summary;
    } catch (err) {
      console.error("Error in getMatchSummary:", err);
      return { error: "Failed to get match summary" };
    }
  }

  /**
   * Get recent matches
   */
  public async getRecentMatches(limit: number = 10): Promise<MatchSummary[] | { error: string }> {
    try {
      const { data, error } = await this.db.client
        .from("spectre_match")
        .select("id, match_data, created_at")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) {
        return { error: error.message };
      }

      if (!data || data.length === 0) {
        return [];
      }

      const summaries: MatchSummary[] = data.map(item => {
        const match = item.match_data as Match;
        const winningTeam = match.teamData.reduce((prev, current) => 
          (prev.roundsWon > current.roundsWon) ? prev : current
        );

        return {
          matchId: match.matchId,
          queueGameMap: match.queueGameMap,
          queueGameMode: match.queueGameMode,
          bIsRanked: match.bIsRanked,
          winningTeamId: winningTeam.teamId,
          created_at: item.created_at,
          teamData: match.teamData.map(team => ({
            teamId: team.teamId,
            roundsWon: team.roundsWon,
            playerNames: team.playerData.map(player => player.savedPlayerName)
          }))
        };
      });

      return summaries;
    } catch (err) {
      console.error("Error in getRecentMatches:", err);
      return { error: "Failed to get recent matches" };
    }
  }

  /**
   * Process player stats after a match
   */
  private async processPlayerStats(
    playerId: string, 
    stats: {
      matchId: string;
      teamId: string;
      won: boolean;
      kills: number;
      deaths: number;
      assists: number;
      mmrChange: number;
      currentMmr: number;
    }
  ): Promise<void> {
    try {
      // Add player match record
      await this.db.client
        .from("spectre_player_match")
        .insert({
          id: crypto.randomUUID(),
          player_id: playerId,
          match_id: stats.matchId,
          team_id: stats.teamId,
          won: stats.won,
          kills: stats.kills,
          deaths: stats.deaths,
          assists: stats.assists,
          mmr_change: stats.mmrChange,
          created_at: new Date().toISOString()
        });

      // Update player stats
      const { data: playerStats } = await this.db.client
        .from("spectre_player_stats")
        .select("*")
        .eq("player_id", playerId)
        .single();

      if (playerStats) {
        await this.db.client
          .from("spectre_player_stats")
          .update({
            mmr: stats.currentMmr,
            updated_at: new Date().toISOString()
          })
          .eq("id", playerStats.id);
      } else {
        // Create new player stats if they don't exist
        await this.db.client
          .from("spectre_player_stats")
          .insert({
            id: crypto.randomUUID(),
            player_id: playerId,
            mmr: stats.currentMmr,
            created_at: new Date().toISOString()
          });
      }
    } catch (err) {
      console.error(`Error processing stats for player ${playerId}:`, err);
    }
  }

  public async checkMatch(matchId: string) {
    try {
      // Implementation based on old API
      // This would check if a match is available to pull from MT servers
      console.log(`Checking match with ID: ${matchId}`);
      
      // Simulate checking match availability
      const isAvailable = Math.random() > 0.2; // 80% chance of being available
      
      if (!isAvailable) {
        return { success: false, error: "Match not available" };
      }
      
      return { success: true, message: "Match is available" };
    } catch (error) {
      console.error("Error checking match:", error);
      return { success: false, error: "Failed to check match" };
    }
  }

  public async addMatchById(matchId: string) {
    try {
      // Implementation based on old API
      // This would add a match to the DB using its ID
      console.log(`Adding match with ID: ${matchId}`);
      
      // First check if the match is available
      const checkResult = await this.checkMatch(matchId);
      if (!checkResult.success) {
        return checkResult;
      }
      
      // Simulate fetching match data from external service
      const matchData = {
        matchId,
        // Add other match data
      };
      
      // Add the match to the database
      const result = await this.addMatch(matchData as any);
      
      return result;
    } catch (error) {
      console.error("Error adding match by ID:", error);
      return { success: false, error: "Failed to add match" };
    }
  }
} 