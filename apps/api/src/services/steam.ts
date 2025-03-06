import SteamAPI from "steamapi";

export class Steam {
  private static instance: Steam;
  public client: SteamAPI;
  
  private constructor() {
    const steamApiKey = process.env.STEAM_API_KEY;
    
    if (!steamApiKey) {
      throw new Error("STEAM_API_KEY is not set");
    }
    
    this.client = new SteamAPI(steamApiKey);
  }

  public static getInstance(): Steam {
    if (!Steam.instance) {
      Steam.instance = new Steam();
    }
    return Steam.instance;
  }
} 