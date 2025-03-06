export class Steam {
  private static instance: Steam;
  private apiKey: string;
  private baseUrl = "https://api.steampowered.com";
  
  private constructor() {
    const steamApiKey = process.env.STEAM_API_KEY;
    
    if (!steamApiKey) {
      throw new Error("STEAM_API_KEY is not set");
    }
    
    this.apiKey = steamApiKey;
  }

  public static getInstance(): Steam {
    if (!Steam.instance) {
      Steam.instance = new Steam();
    }
    return Steam.instance;
  }

  /**
   * Get player summary by Steam ID
   * @param steamId - The Steam ID of the player
   */
  public async getPlayerSummary(steamId: string) {
    try {
      const response = await fetch(
        `${this.baseUrl}/ISteamUser/GetPlayerSummaries/v2/?key=${this.apiKey}&steamids=${steamId}`
      );
      
      if (!response.ok) {
        throw new Error(`Steam API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.response.players[0] || null;
    } catch (error) {
      console.error("Error fetching player summary from Steam:", error);
      return null;
    }
  }

  /**
   * Get player's owned games
   * @param steamId - The Steam ID of the player
   */
  public async getOwnedGames(steamId: string) {
    try {
      const response = await fetch(
        `${this.baseUrl}/IPlayerService/GetOwnedGames/v1/?key=${this.apiKey}&steamid=${steamId}&include_appinfo=true&include_played_free_games=true`
      );
      
      if (!response.ok) {
        throw new Error(`Steam API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error("Error fetching owned games from Steam:", error);
      return null;
    }
  }

  /**
   * Get player's friends list
   * @param steamId - The Steam ID of the player
   */
  public async getFriendsList(steamId: string) {
    try {
      const response = await fetch(
        `${this.baseUrl}/ISteamUser/GetFriendList/v1/?key=${this.apiKey}&steamid=${steamId}&relationship=friend`
      );
      
      if (!response.ok) {
        throw new Error(`Steam API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.friendslist?.friends || [];
    } catch (error) {
      console.error("Error fetching friends list from Steam:", error);
      return [];
    }
  }

  /**
   * Get player's recently played games
   * @param steamId - The Steam ID of the player
   */
  public async getRecentlyPlayedGames(steamId: string) {
    try {
      const response = await fetch(
        `${this.baseUrl}/IPlayerService/GetRecentlyPlayedGames/v1/?key=${this.apiKey}&steamid=${steamId}&count=10`
      );
      
      if (!response.ok) {
        throw new Error(`Steam API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.response.games || [];
    } catch (error) {
      console.error("Error fetching recently played games from Steam:", error);
      return [];
    }
  }

  /**
   * Resolve vanity URL to Steam ID
   * @param vanityUrl - The vanity URL of the player
   */
  public async resolveVanityUrl(vanityUrl: string) {
    try {
      const response = await fetch(
        `${this.baseUrl}/ISteamUser/ResolveVanityURL/v1/?key=${this.apiKey}&vanityurl=${vanityUrl}`
      );
      
      if (!response.ok) {
        throw new Error(`Steam API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.response.success === 1 ? data.response.steamid : null;
    } catch (error) {
      console.error("Error resolving vanity URL from Steam:", error);
      return null;
    }
  }
} 