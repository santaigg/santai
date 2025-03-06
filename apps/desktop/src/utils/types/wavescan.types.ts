export interface PlayerProfile {
  id: string;
  name: string;
  discriminator?: string;
  steam_profile: {
    id?: string;
    avatar?: {
      small: string;
      medium: string;
      large: string;
      hash: string;
    };
    url?: string;
  };
  stats: {
    rank_rating?: number;
    current_solo_rank?: number;
    highest_team_rank?: number;
    rank_rating_last_updated?: string | null;
  };
}

export interface Match_Team {
  id: string;
  team_id: string;
  team_index: number;
  rounds_won: number;
  rounds_played: number;
  xp_earned: number;
  fans_earned: number;
  used_team_rank: boolean;
  team_rank: number;
  previous_team_rank: number;
  num_ranked_matches: number;
  ranked_rating: number;
  ranked_rating_delta: number;
  previous_ranked_rating: number;
  is_full_party: boolean;
  players: {
    id: string;
    name: string;
    kills: number;
    assists: number;
    deaths: number;
    damage_dealt: number;
    teammate_index: number;
    sponsor_id: string;
    sponsor_name: string;
    ranked_rating: number;
    previous_ranked_rating: number;
    ranked_rating_delta: number;
    rank_id: string;
    previous_rank_id: string;
    banner_id: string;
    crew_score: number;
    crew_id: string;
    team_id: string;
    division_id: string;
    num_ranked_matches: number;
    is_anonymous: boolean;
  }[];
}

export interface PlayerMatch {
  id: string;
  region: string;
  is_ranked: boolean;
  queue_name: string;
  map: string;
  game_mode: string;
  surrended_team: number;
  is_abandoned: boolean;
  match_date: Date;
  rounds: number;
  winner: -1 | 0 | 1;
  player_team: Match_Team;
  opponent_team: Match_Team | null;
}

export interface PlayerExtendedStats {
  total_kills: number;
  total_assists: number;
  total_deaths: number;
  total_damage_dealt: number;
  total_wins: number;
  total_losses: number;
  total_draws: number;
  total_rounds_played: number;
  top_damage_dealt: number;
  top_kills: number;
  top_assists: number;
  top_deaths: number;
  average_win_percentage: number;
  average_damage_per_round: number;
  average_kills_per_round: number;
  average_assists_per_round: number;
  average_deaths_per_round: number;
}

// Update the SeasonStats interface
export interface SeasonStats extends PlayerExtendedStats {
  season: string;
  top_rank_id: string;
  top_rank_rating: number;
}

export interface MapStats extends PlayerExtendedStats {
  map: string;
}

export interface SponsorStats extends PlayerExtendedStats {
  sponsor_id: string;
  sponsor_name: string;
}

export interface PlayerFullProfile extends PlayerProfile {
  matches: PlayerMatch[];
  extended_stats?: {
    season_stats: { [key: string]: SeasonStats };
    last_20_matches_avg_stats: PlayerExtendedStats;
    map_stats: { [key: string]: MapStats };
    sponsor_stats: { [key: string]: SponsorStats };
  };
}

// Example PlayerFullProfile
export const playerProfile: PlayerFullProfile = {
  id: "player123",
  name: "JohnDoe",
  discriminator: "001",
  steam_profile: {
    id: "steam123",
    avatar: {
      small: "https://example.com/avatars/small.jpg",
      medium: "https://example.com/avatars/medium.jpg",
      large: "https://example.com/avatars/large.jpg",
      hash: "abc123",
    },
    url: "https://steamcommunity.com/id/johndoe",
  },
  stats: {
    rank_rating: 4500,
    current_solo_rank: 27,
    highest_team_rank: 3,
    rank_rating_last_updated: "2025-02-21",
  },
  matches: [],
  extended_stats: {
    season_stats: {
      "2025-S1": {
        season: "2025-S1",
        top_rank_id: "29",
        top_rank_rating: 5400,
        total_kills: 100,
        total_assists: 50,
        total_deaths: 30,
        total_damage_dealt: 50000,
        total_wins: 20,
        total_losses: 5,
        total_draws: 0,
        total_rounds_played: 25,
        top_damage_dealt: 5000,
        top_kills: 15,
        top_assists: 10,
        top_deaths: 5,
        average_win_percentage: 80,
        average_damage_per_round: 200,
        average_kills_per_round: 4,
        average_assists_per_round: 2,
        average_deaths_per_round: 1.2,
      },
    },
    last_20_matches_avg_stats: {
      total_kills: 80,
      total_assists: 40,
      total_deaths: 25,
      total_damage_dealt: 4000,
      total_wins: 16,
      total_losses: 4,
      total_draws: 0,
      total_rounds_played: 20,
      top_damage_dealt: 450,
      top_kills: 12,
      top_assists: 8,
      top_deaths: 4,
      average_win_percentage: 80,
      average_damage_per_round: 200,
      average_kills_per_round: 4,
      average_assists_per_round: 2,
      average_deaths_per_round: 1.25,
    },
    map_stats: {
      commons_p: {
        map: "commons_p",
        total_kills: 30,
        total_assists: 15,
        total_deaths: 10,
        total_damage_dealt: 1500,
        total_wins: 6,
        total_losses: 2,
        total_draws: 0,
        total_rounds_played: 8,
        top_damage_dealt: 300,
        top_kills: 8,
        top_assists: 5,
        top_deaths: 3,
        average_win_percentage: 75,
        average_damage_per_round: 187.5,
        average_kills_per_round: 3.75,
        average_assists_per_round: 1.88,
        average_deaths_per_round: 1.25,
      },
      metro_p: {
        map: "metro_p",
        total_kills: 30,
        total_assists: 15,
        total_deaths: 10,
        total_damage_dealt: 1500,
        total_wins: 6,
        total_losses: 2,
        total_draws: 0,
        total_rounds_played: 8,
        top_damage_dealt: 300,
        top_kills: 8,
        top_assists: 5,
        top_deaths: 3,
        average_win_percentage: 75,
        average_damage_per_round: 187.5,
        average_kills_per_round: 3.75,
        average_assists_per_round: 1.88,
        average_deaths_per_round: 1.25,
      },
      // Additional maps can be added here
    },
    sponsor_stats: {
      Sponsor: {
        sponsor_id: "disruptor",
        sponsor_name: "Umbra",
        total_kills: 50,
        total_assists: 25,
        total_deaths: 15,
        total_damage_dealt: 2500,
        total_wins: 10,
        total_losses: 3,
        total_draws: 0,
        total_rounds_played: 13,
        top_damage_dealt: 400,
        top_kills: 12,
        top_assists: 8,
        top_deaths: 4,
        average_win_percentage: 76.9,
        average_damage_per_round: 192.3,
        average_kills_per_round: 3.85,
        average_assists_per_round: 1.92,
        average_deaths_per_round: 1.15,
      },
      // Additional sponsors can be added here
    },
  },
};
