import { Database } from "../../../services/database";
import { Steam } from "../../../services/steam";
import { ConnectionType, PlayerConnection, PlayerFullProfile, PlayerProfile } from "./types";

export class PlayerService {
  private db: Database;
  private steam: Steam;

  constructor() {
    this.db = Database.getInstance();
    this.steam = Steam.getInstance();
  }

  async getPlayerById(id: string): Promise<PlayerProfile | null> {
    try {
      const { data, error } = await this.db.client
        .from("spectre_player")
        .select("*, spectre_player_stats(*)")
        .eq("id", id)
        .single();

      if (error || !data) {
        return null;
      }

      // Get Steam profile if available
      let steamProfile = null;
      const { data: steamConnection, error: steamError } = await this.db.client
        .from("spectre_player_account")
        .select("*")
        .eq("player", id)
        .eq("provider", "STEAM")
        .single();

      if (steamConnection && !steamError) {
        steamProfile = {
          steam_id: steamConnection.account_id,
          // Other Steam profile data would go here
        };
      }

      return {
        ...data,
        steam_profile: steamProfile,
      };
    } catch (error) {
      console.error("Error fetching player by ID:", error);
      return null;
    }
  }

  async getPlayerConnections(playerId: string): Promise<PlayerConnection[]> {
    try {
      const { data, error } = await this.db.client
        .from("spectre_player_connections")
        .select("*")
        .eq("player_id", playerId);

      if (error || !data) {
        return [];
      }

      return data as PlayerConnection[];
    } catch (error) {
      console.error("Error fetching player connections:", error);
      return [];
    }
  }

  async getPlayerByConnectionId(
    type: ConnectionType,
    accountId: string
  ): Promise<string | null> {
    try {
      const { data, error } = await this.db.client
        .from("spectre_player_connections")
        .select("player_id")
        .eq("provider_type", type)
        .eq("account_id", accountId)
        .single();

      if (error || !data) {
        return null;
      }

      return data.player_id;
    } catch (error) {
      console.error("Error fetching player by connection ID:", error);
      return null;
    }
  }

  async getFullPlayerProfile(id: string): Promise<PlayerFullProfile | null> {
    try {
      const player = await this.getPlayerById(id);
      
      if (!player) {
        return null;
      }

      const connections = await this.getPlayerConnections(id);
      
      // Get match history
      const { data: matchHistory, error: matchError } = await this.db.client
        .from("spectre_match_player")
        .select("*, spectre_match_team(*, spectre_match(*))")
        .eq("player", id)
        .order("created_at", { ascending: false })
        .limit(10);

      if (matchError) {
        console.error("Error fetching match history:", matchError);
      }

      // Calculate extended stats
      const { count: totalMatches, error: countError } = await this.db.client
        .from("spectre_match_player")
        .select("*", { count: "exact", head: true })
        .eq("player", id);

      if (countError) {
        console.error("Error counting matches:", countError);
      }

      const { count: wins, error: winsError } = await this.db.client
        .from("spectre_match_player")
        .select("*", { count: "exact", head: true })
        .eq("player", id)
        .eq("result", "win");

      if (winsError) {
        console.error("Error counting wins:", winsError);
      }

      const losses = totalMatches ? totalMatches - (wins || 0) : 0;
      const winRate = totalMatches && wins ? (wins / totalMatches) * 100 : 0;

      // Get season stats (simplified for this example)
      const seasonStats = [
        {
          season_id: "s1",
          season_name: "Season 1",
          total_matches: Math.floor((totalMatches || 0) * 0.7),
          wins: Math.floor((wins || 0) * 0.7),
          losses: Math.floor(losses * 0.7),
          win_rate: winRate,
        },
      ];

      const extendedStats = {
        total_matches: totalMatches || 0,
        wins: wins || 0,
        losses,
        win_rate: winRate,
        season_stats: seasonStats,
      };

      return {
        ...player,
        connections,
        match_history: matchHistory || [],
        extended_stats: extendedStats,
      };
    } catch (error) {
      console.error("Error fetching full player profile:", error);
      return null;
    }
  }

  public async getPlayerStats(playerId: string) {
    try {
      const { data, error } = await this.db.client
        .from("spectre_player_stats")
        .select("*")
        .eq("player", playerId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data: data[0] };
    } catch (error) {
      console.error("Error fetching player stats:", error);
      return { success: false, error: "Failed to fetch player stats" };
    }
  }

  public async getPlayerBanner(playerId: string) {
    try {
      const { data, error } = await this.db.client
        .from("spectre_player_banner")
        .select("*")
        .eq("player", playerId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data: data[0] };
    } catch (error) {
      console.error("Error fetching player banner:", error);
      return { success: false, error: "Failed to fetch player banner" };
    }
  }

  public async getPlayerAccount(playerId: string) {
    try {
      const { data, error } = await this.db.client
        .from("spectre_player_account")
        .select("*")
        .eq("player", playerId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data: data[0] };
    } catch (error) {
      console.error("Error fetching player account:", error);
      return { success: false, error: "Failed to fetch player account" };
    }
  }

  public async getPlayerProfile(playerId: string) {
    try {
      // This is a simplified version of the full profile
      const { data, error } = await this.db.client
        .from("spectre_player")
        .select("*, spectre_player_stats(*)")
        .eq("id", playerId)
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error("Error fetching player profile:", error);
      return { success: false, error: "Failed to fetch player profile" };
    }
  }

  public async getPlayerIdFromSteamId(steamId: string) {
    try {
      const { data, error } = await this.db.client
        .from("spectre_player_account")
        .select("player")
        .eq("steam_id", steamId)
        .single();

      if (error || !data) {
        return { success: false, error: "Player not found" };
      }

      return { success: true, player_id: data.player };
    } catch (error) {
      console.error("Error fetching player ID from Steam ID:", error);
      return { success: false, error: "Failed to fetch player ID" };
    }
  }

  public async getPlayerGameRanks(playerId: string) {
    try {
      const { data, error } = await this.db.client
        .from("spectre_player_stats")
        .select("solo_rank, team_rank")
        .eq("player", playerId)
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { 
        success: true, 
        solo_rank: data.solo_rank,
        team_rank: data.team_rank
      };
    } catch (error) {
      console.error("Error fetching player game ranks:", error);
      return { success: false, error: "Failed to fetch player game ranks" };
    }
  }

  public async getPlayerSteamProfile(playerId: string) {
    try {
      // First get the player's Steam ID
      const { data, error } = await this.db.client
        .from("spectre_player_account")
        .select("steam_id")
        .eq("player", playerId)
        .single();

      if (error || !data || !data.steam_id) {
        return { success: false, error: "Steam profile not found" };
      }

      // Use our Steam service to get the profile
      const steamId = data.steam_id;
      const steamProfile = await this.steam.getPlayerSummary(steamId);
      
      if (!steamProfile) {
        return { success: false, error: "Failed to fetch Steam profile" };
      }

      return { 
        success: true, 
        steam_profile: {
          avatar: {
            small: steamProfile.avatar,
            medium: steamProfile.avatarmedium,
            large: steamProfile.avatarfull
          },
          nickname: steamProfile.personaname,
          url: steamProfile.profileurl,
          created: steamProfile.timecreated,
          lastLogOff: steamProfile.lastlogoff,
          countryCode: steamProfile.loccountrycode,
          profileState: steamProfile.profilestate,
          personaState: steamProfile.personastate
        }
      };
    } catch (error) {
      console.error("Error fetching player Steam profile:", error);
      return { success: false, error: "Failed to fetch player Steam profile" };
    }
  }
} 