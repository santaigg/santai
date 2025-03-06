import { ConnectionType, Match_Team, PlayerConnection, PlayerExtendedStats, PlayerFullProfile, PlayerMatch, PlayerProfile } from "../v1/types";

// Enhanced player profile with additional fields
export interface PlayerProfileV2 extends PlayerProfile {
  discord_profile?: any; // Discord profile data
  twitch_profile?: any; // Twitch profile data
  preferences?: PlayerPreferences;
}

export interface PlayerFullProfileV2 extends PlayerFullProfile {
  achievements?: PlayerAchievement[];
  friends?: PlayerFriend[];
  preferences?: PlayerPreferences;
}

export interface PlayerAchievement {
  id: string;
  player_id: string;
  achievement_id: string;
  achievement_name: string;
  description: string;
  unlocked_at: string;
  icon_url: string | null;
}

export interface PlayerFriend {
  id: string;
  player_id: string;
  friend_id: string;
  friend_username: string;
  friend_avatar_url: string | null;
  created_at: string;
}

export interface PlayerPreferences {
  id: string;
  player_id: string;
  theme: string;
  notifications_enabled: boolean;
  privacy_level: PrivacyLevel;
  created_at: string;
  updated_at: string | null;
}

export enum PrivacyLevel {
  PUBLIC = "public",
  FRIENDS_ONLY = "friends_only",
  PRIVATE = "private",
}

// Re-export v1 types for backward compatibility
export { ConnectionType };
export type { 
  Match_Team,
  PlayerConnection,
  PlayerExtendedStats,
  PlayerMatch,
}; 