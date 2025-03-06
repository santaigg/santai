import { Database } from "../../services/database.ts";

export interface SponsorStats {
  totalSponsors: number;
  totalAmount: number;
  // Add other fields as needed
}

export class SponsorService {
  private static instance: SponsorService;
  private db: Database;

  private constructor() {
    this.db = Database.getInstance();
  }

  public static getInstance(): SponsorService {
    if (!SponsorService.instance) {
      SponsorService.instance = new SponsorService();
    }
    return SponsorService.instance;
  }

  public async getGlobalSponsorStats(): Promise<{ success: boolean; data?: SponsorStats; error?: string }> {
    try {
      // Implementation based on old API
      // This would fetch global sponsor stats from the database
      const { data, error } = await this.db.client
        .from("sponsor_stats")
        .select("*")
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { 
        success: true, 
        data: {
          totalSponsors: data.total_sponsors,
          totalAmount: data.total_amount,
          // Add other fields as needed
        } 
      };
    } catch (error) {
      console.error("Error fetching global sponsor stats:", error);
      return { success: false, error: "Failed to fetch sponsor stats" };
    }
  }
} 