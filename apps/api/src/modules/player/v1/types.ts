// Player module types

export enum ConnectionType {
  STEAM = "steam",
  DISCORD = "discord",
  TWITCH = "twitch",
}

export enum Match_Team {
  RADIANT = "radiant",
  DIRE = "dire",
}

export interface PlayerProfile {
  id: string;
  username: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string | null;
  steam_profile?: any; // Steam profile data
  stats?: {
    id: string;
    player_id: string;
    mmr: number | null;
    rank: number | null;
    created_at: string;
    updated_at: string | null;
  };
}

export interface PlayerConnection {
  id: string;
  player_id: string;
  provider_type: string;
  account_id: string;
  created_at: string;
  updated_at: string | null;
}

export interface PlayerFullProfile extends PlayerProfile {
  connections: PlayerConnection[];
  match_history?: PlayerMatch[];
  extended_stats?: PlayerExtendedStats;
}

export interface PlayerMatch {
  id: string;
  match_id: string;
  player_id: string;
  team: Match_Team;
  created_at: string;
}

export interface PlayerExtendedStats {
  total_matches: number;
  wins: number;
  losses: number;
  win_rate: number;
  season_stats?: SeasonStats[];
}

export interface SeasonStats {
  season_id: string;
  season_name: string;
  total_matches: number;
  wins: number;
  losses: number;
  win_rate: number;
} 