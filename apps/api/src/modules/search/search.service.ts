import { Database } from "../../services/database.ts";

export class SearchService {
  private static instance: SearchService;
  private db: Database;

  private constructor() {
    this.db = Database.getInstance();
  }

  public static getInstance(): SearchService {
    if (!SearchService.instance) {
      SearchService.instance = new SearchService();
    }
    return SearchService.instance;
  }

  public async searchPlayer(term: string, limit: number = 10) {
    try {
      // Implementation based on old API
      // This would search for players in the database
      if (!term) {
        return { success: false, error: "Search term is required" };
      }

      const { data, error } = await this.db.client
        .from("spectre_player")
        .select("*")
        .ilike("name", `%${term}%`)
        .limit(limit);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error("Error searching for players:", error);
      return { success: false, error: "Failed to search for players" };
    }
  }
} 