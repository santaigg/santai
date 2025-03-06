import { Database } from "../../services/database.ts";

export class LeaderboardService {
  private static instance: LeaderboardService;
  private db: Database;

  private constructor() {
    this.db = Database.getInstance();
  }

  public static getInstance(): LeaderboardService {
    if (!LeaderboardService.instance) {
      LeaderboardService.instance = new LeaderboardService();
    }
    return LeaderboardService.instance;
  }

  public async getSoloRankedLeaderboard(limit: number = 100, season?: number) {
    try {
      // Implementation based on old API
      // This would fetch the solo ranked leaderboard from the database
      let query = this.db.client
        .from("spectre_player_stats")
        .select("*, spectre_player!inner(*)");
      
      // Add season filter if provided
      if (season !== undefined) {
        query = query.eq("season", season);
      }
      
      const { data, error } = await query
        .order("elo", { ascending: false })
        .limit(limit);

      if (error) {
        return { success: false, error: error.message };
      }

      return { 
        success: true, 
        data: data.map(player => ({
          id: player.spectre_player.id,
          name: player.spectre_player.name,
          elo: player.elo,
          rank: player.rank,
          // Add other fields as needed
        }))
      };
    } catch (error) {
      console.error("Error fetching solo ranked leaderboard:", error);
      return { success: false, error: "Failed to fetch leaderboard data" };
    }
  }
} 