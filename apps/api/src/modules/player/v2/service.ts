import { Database } from "../../../services/database";
import { PlayerService as PlayerServiceV1 } from "../v1/service";
import { ConnectionType } from "../v1/types";
import { PlayerAchievement, PlayerFriend, PlayerFullProfileV2, PlayerPreferences, PlayerProfileV2, PrivacyLevel } from "./types";

export class PlayerService extends PlayerServiceV1 {
  async getPlayerById(id: string): Promise<PlayerProfileV2 | null> {
    const player = await super.getPlayerById(id);
    const database = Database.getInstance();
    if (!player) {
      return null;
    }

    // Get Discord profile if available
    let discordProfile = null;
    const discordConnection = await database.query.player_connections.findFirst({
      where: (connections, { eq, and }) => 
        and(
          eq(connections.player_id, id),
          eq(connections.provider_type, ConnectionType.DISCORD)
        ),
    });

    if (discordConnection) {
      // In a real app, we would fetch the Discord profile data
      discordProfile = {
        discord_id: discordConnection.account_id,
        // Other Discord profile data would go here
      };
    }

    // Get Twitch profile if available
    let twitchProfile = null;
    const twitchConnection = await database.query.player_connections.findFirst({
      where: (connections, { eq, and }) => 
        and(
          eq(connections.player_id, id),
          eq(connections.provider_type, ConnectionType.TWITCH)
        ),
    });

    if (twitchConnection) {
      // In a real app, we would fetch the Twitch profile data
      twitchProfile = {
        twitch_id: twitchConnection.account_id,
        // Other Twitch profile data would go here
      };
    }

    // Get player preferences
    const preferences = await this.getPlayerPreferences(id);

    return {
      ...player,
      discord_profile: discordProfile,
      twitch_profile: twitchProfile,
      preferences,
    };
  }

  async getFullPlayerProfile(id: string): Promise<PlayerFullProfileV2 | null> {
    const baseProfile = await super.getFullPlayerProfile(id);
    
    if (!baseProfile) {
      return null;
    }

    // Get player achievements
    const achievements = await this.getPlayerAchievements(id);
    
    // Get player friends
    const friends = await this.getPlayerFriends(id);
    
    // Get player preferences
    const preferences = await this.getPlayerPreferences(id);

    return {
      ...baseProfile,
      achievements,
      friends,
      preferences,
    };
  }

  async getPlayerAchievements(playerId: string): Promise<PlayerAchievement[]> {
    // In a real app, we would fetch from the database
    // For now, return mock data
    return [
      {
        id: "ach1",
        player_id: playerId,
        achievement_id: "first_win",
        achievement_name: "First Victory",
        description: "Win your first match",
        unlocked_at: new Date().toISOString(),
        icon_url: "https://example.com/achievements/first_win.png",
      },
      {
        id: "ach2",
        player_id: playerId,
        achievement_id: "ten_wins",
        achievement_name: "Decathlon",
        description: "Win 10 matches",
        unlocked_at: new Date().toISOString(),
        icon_url: "https://example.com/achievements/ten_wins.png",
      },
    ];
  }

  async getPlayerFriends(playerId: string): Promise<PlayerFriend[]> {
    // In a real app, we would fetch from the database
    // For now, return mock data
    return [
      {
        id: "fr1",
        player_id: playerId,
        friend_id: "player2",
        friend_username: "FriendlyPlayer",
        friend_avatar_url: "https://example.com/avatars/player2.png",
        created_at: new Date().toISOString(),
      },
      {
        id: "fr2",
        player_id: playerId,
        friend_id: "player3",
        friend_username: "AnotherFriend",
        friend_avatar_url: "https://example.com/avatars/player3.png",
        created_at: new Date().toISOString(),
      },
    ];
  }

  async getPlayerPreferences(playerId: string): Promise<PlayerPreferences | null> {
    // In a real app, we would fetch from the database
    // For now, return mock data
    return {
      id: "pref1",
      player_id: playerId,
      theme: "dark",
      notifications_enabled: true,
      privacy_level: PrivacyLevel.FRIENDS_ONLY,
      created_at: new Date().toISOString(),
      updated_at: null,
    };
  }

  async updatePlayerPreferences(
    playerId: string,
    preferences: Partial<PlayerPreferences>
  ): Promise<PlayerPreferences | null> {
    // In a real app, we would update the database
    // For now, return mock data with the updates
    const currentPreferences = await this.getPlayerPreferences(playerId);
    
    if (!currentPreferences) {
      return null;
    }

    const updatedPreferences = {
      ...currentPreferences,
      ...preferences,
      updated_at: new Date().toISOString(),
    };

    return updatedPreferences;
  }
} 