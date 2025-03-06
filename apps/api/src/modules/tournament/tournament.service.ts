import { Database } from "../../services/database.ts";
import { Redis } from "../../services/redis.ts";

// Define types for tournament data
export interface TournamentData {
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  // Add other fields as needed
}

// Define types for match data
export interface MatchData {
  matchId: string;
  // Add other fields as needed
}

export class TournamentService {
  private static instance: TournamentService;
  private db: Database;
  private redis: Redis;

  private constructor() {
    this.db = Database.getInstance();
    this.redis = Redis.getInstance();
  }

  public static getInstance(): TournamentService {
    if (!TournamentService.instance) {
      TournamentService.instance = new TournamentService();
    }
    return TournamentService.instance;
  }

  // Tournament data methods
  public async fetchTournament(id: string = 'default') {
    try {
      console.log(`Fetching tournament with ID: ${id}`);
      
      const { data, error } = await this.db.client
        .from("tournament")
        .select("*")
        .eq("tournament_id", id)
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error("Error fetching tournament:", error);
      return { success: false, error: "Failed to fetch tournament data" };
    }
  }

  public async updateTournament(tournamentData: TournamentData) {
    try {
      // Implementation based on old API
      // This would update tournament data in the database
      const { data, error } = await this.db.client
        .from("tournament")
        .update(tournamentData)
        .eq("id", 1) // Assuming there's only one tournament record
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error("Error updating tournament:", error);
      return { success: false, error: "Failed to update tournament data" };
    }
  }

  // Match methods
  public async addMatch(matchData: MatchData) {
    try {
      // Implementation based on old API
      // This would add a match to the tournament
      const { data, error } = await this.db.client
        .from("tournament_match")
        .insert(matchData)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error("Error adding match:", error);
      return { success: false, error: "Failed to add match" };
    }
  }

  public async updateMatch(matchData: MatchData) {
    try {
      // Implementation based on old API
      // This would update a match in the tournament
      const { data, error } = await this.db.client
        .from("tournament_match")
        .update(matchData)
        .eq("match_id", matchData.matchId)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error("Error updating match:", error);
      return { success: false, error: "Failed to update match" };
    }
  }

  public async deleteMatch(matchId: string) {
    try {
      // Implementation based on old API
      // This would delete a match from the tournament
      const { error } = await this.db.client
        .from("tournament_match")
        .delete()
        .eq("match_id", matchId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error("Error deleting match:", error);
      return { success: false, error: "Failed to delete match" };
    }
  }

  public async resetTournamentData() {
    try {
      // Implementation based on old API
      // This would reset all tournament data
      const { error } = await this.db.client
        .from("tournament_match")
        .delete()
        .neq("id", 0); // Delete all matches

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error("Error resetting tournament data:", error);
      return { success: false, error: "Failed to reset tournament data" };
    }
  }

  public async createDefaultMatch() {
    try {
      // Implementation based on old API
      // This would create a default match template
      const defaultMatch = {
        matchId: `default-${Date.now()}`,
        // Add default match data
      };

      return { success: true, data: defaultMatch };
    } catch (error) {
      console.error("Error creating default match:", error);
      return { success: false, error: "Failed to create default match" };
    }
  }

  // Admin authentication methods
  public async authenticateAdmin(password: string) {
    try {
      // Implementation based on old API
      // This would authenticate an admin
      const adminPassword = process.env.ADMIN_PASSWORD;
      
      if (password !== adminPassword) {
        return { success: false, error: "Invalid password" };
      }

      // Generate a token and store it in Redis
      const token = `admin-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
      await this.redis.client.set(`admin:token:${token}`, "1", { ex: 86400 }); // 24 hours

      return { success: true, token };
    } catch (error) {
      console.error("Error authenticating admin:", error);
      return { success: false, error: "Failed to authenticate admin" };
    }
  }

  public async isAdminAuthenticated(token: string) {
    try {
      // Implementation based on old API
      // This would check if an admin is authenticated
      const exists = await this.redis.client.exists(`admin:token:${token}`);
      
      return { success: true, authenticated: exists === 1 };
    } catch (error) {
      console.error("Error checking admin authentication:", error);
      return { success: false, error: "Failed to check admin authentication" };
    }
  }

  public async logoutAdmin() {
    try {
      return { success: true };
    } catch (error) {
      console.error("Error logging out admin:", error);
      return { success: false, error: "Failed to logout admin" };
    }
  }
} 