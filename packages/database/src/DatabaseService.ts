import { createClient, SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../database.types' // Generated Supabase types
import { 
  Player, Crew, Division, PlayerStats, PlayerBanner, 
  PlayerAccount, TeamMembership, Team, MatchPlayer, 
  MatchTeam, Match 
} from './models'
import { randomUUID } from 'crypto'
import type { MatchData } from '@repo/pulsefinder-types'

export class DatabaseService {
  private client: SupabaseClient<Database>

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.client = createClient<Database>(supabaseUrl, supabaseKey)
  }

  async getPlayer(playerId: string) {
    // Select all data that is relevant to the player
    const { data, error } = await this.client
      .from('spectre_player')
      .select(`
        *,
        spectre_player_stats ( * ),
        spectre_player_banner ( * ),
        spectre_player_account ( * ),
        spectre_team_member (
          *,
          spectre_team ( * )
        ),
        spectre_match_player (
          *,
          spectre_match_team (
            *,
            spectre_match ( * )
          )
        )
      `)
      .eq('id', playerId)
      .single()

    if (error) {
      throw new DatabaseError('Failed to fetch player', { cause: error })
    }

    return this.mapToPlayer(data)
  }

  /**
   * Update a player's basic profile information
   */
  async updatePlayer(player: Player) {
    // Convert from domain model to database format
    const dbPlayer = this.playerToDbFormat(player)
    
    // Update the player record
    const { error } = await this.client
      .from('spectre_player')
      .update(dbPlayer)
      .eq('id', player.id)
    
    if (error) {
      throw new DatabaseError('Failed to update player', { cause: error })
    }
    
    // If player stats exist and need to be updated
    if (player.stats) {
      await this.updatePlayerStats(player.id, player.stats)
    }
    
    // If player banner exists and needs to be updated
    if (player.banner) {
      await this.updatePlayerBanner(player.id, player.banner)
    }
    
    return this.getPlayer(player.id) // Return the updated player
  }
  
  /**
   * Update a player's stats
   */
  async updatePlayerStats(playerId: string, stats: PlayerStats) {
    const dbStats = {
      player: playerId,
      current_solo_rank: stats.currentSoloRank,
      highest_team_rank: stats.highestTeamRank,
      rank_rating: stats.rankRating,
      last_updated_rank_rating: stats.lastUpdatedRankRating ? stats.lastUpdatedRankRating.toISOString() : null,
      updated_at: new Date().toISOString()
    }
    
    const { error } = await this.client
      .from('spectre_player_stats')
      .upsert(dbStats)
      .eq('player', playerId)
    
    if (error) {
      throw new DatabaseError('Failed to update player stats', { cause: error })
    }
  }
  
  /**
   * Update a player's banner
   */
  async updatePlayerBanner(playerId: string, banner: PlayerBanner) {
    const dbBanner = {
      player: playerId,
      item_instance_id: banner.itemInstanceId,
      item_catalog_id: banner.itemCatalogId,
      item_type: banner.itemType,
      alteration_data: banner.alterationData,
      attachment_item_instance_id: banner.attachmentItemInstanceId,
      attachment_item_catalog_id: banner.attachmentItemCatalogId,
      updated_at: new Date().toISOString()
    }
    
    const { error } = await this.client
      .from('spectre_player_banner')
      .upsert(dbBanner)
      .eq('player', playerId)
    
    if (error) {
      throw new DatabaseError('Failed to update player banner', { cause: error })
    }
  }
  
  /**
   * Convert a Player domain model to database format
   */
  private playerToDbFormat(player: Player) {
    return {
      id: player.id,
      display_name: player.displayName,
      discriminator: player.discriminator,
      crew_id: player.crew?.id || null,
      updated_at: new Date().toISOString()
    }
  }

  private mapToPlayer(data: any): Player {
    // Transform raw database record to Player object
    return {
      id: data.id,
      displayName: data.display_name,
      discriminator: data.discriminator,
      createdAt: new Date(data.created_at),
      updatedAt: data.updated_at ? new Date(data.updated_at) : null,
      crew: data.crew_id ? this.mapToCrew(data.crew) : null,
      stats: data.spectre_player_stats ? this.mapToPlayerStats(data.spectre_player_stats) : null,
      banner: data.spectre_player_banner ? this.mapToPlayerBanner(data.spectre_player_banner) : null,
      accounts: data.spectre_player_account ? data.spectre_player_account.map((account: any) => this.mapToPlayerAccount(account)) : [],
      teams: data.spectre_team_member ? data.spectre_team_member.map((member: any) => this.mapToTeamMembership(member)) : [],
      matches: data.spectre_match_player ? data.spectre_match_player.map((match: any) => this.mapToMatchPlayer(match)) : []
    }
  }

  private mapToCrew(data: any): Crew {
    return {
      id: data.id,
      name: data.name,
      homeTurf: data.home_turf,
      totalScore: data.total_score,
      divisionId: data.division_id,
      division: data.division ? this.mapToDivision(data.division) : null
    }
  }

  private mapToDivision(data: any): Division {
    return {
      id: data.id,
      name: data.name,
      type: data.type
    }
  }

  private mapToPlayerStats(data: any): PlayerStats {
    return {
      currentSoloRank: data.current_solo_rank,
      highestTeamRank: data.highest_team_rank,
      rankRating: data.rank_rating,
      lastUpdatedRankRating: data.last_updated_rank_rating ? new Date(data.last_updated_rank_rating) : null
    }
  }

  private mapToPlayerBanner(data: any): PlayerBanner {
    return {
      itemInstanceId: data.item_instance_id,
      itemCatalogId: data.item_catalog_id,
      itemType: data.item_type,
      alterationData: data.alteration_data,
      attachmentItemInstanceId: data.attachment_item_instance_id,
      attachmentItemCatalogId: data.attachment_item_catalog_id
    }
  }

  private mapToPlayerAccount(data: any): PlayerAccount {
    return {
      id: data.id,
      accountId: data.account_id,
      displayName: data.display_name,
      providerType: data.provider_type
    }
  }

  private mapToTeamMembership(data: any): TeamMembership {
    return {
      id: data.id,
      team: this.mapToTeam(data.spectre_team)
    }
  }

  private mapToTeam(data: any): Team {
    return {
      id: data.id,
      teamName: data.team_name,
      teamSize: data.team_size,
      teamData: data.team_data,
      lastPlayed: data.last_played ? new Date(data.last_played) : null
    }
  }

  private mapToMatchPlayer(data: any): MatchPlayer {
    return {
      id: data.id,
      savedPlayerName: data.saved_player_name,
      savedSponsorName: data.saved_sponsor_name,
      selectedSponsor: data.selected_sponsor,
      selectedBannerCatalogId: data.selected_banner_catalog_id,
      numKills: data.num_kills,
      numDeaths: data.num_deaths,
      numAssists: data.num_assists,
      totalDamageDeone: data.total_damage_done,
      currentRankId: data.current_rank_id,
      previousRankId: data.previous_rank_id,
      currentRankedRating: data.current_ranked_rating,
      previousRankedRating: data.previous_ranked_rating,
      numRankedMatches: data.num_ranked_matches,
      isAnonymousPlayer: data.is_anonymous_player,
      teammateIndex: data.teammate_index,
      crewScore: data.crew_score,
      team: this.mapToMatchTeam(data.spectre_match_team)
    }
  }

  private mapToMatchTeam(data: any): MatchTeam {
    return {
      id: data.id,
      teamIndex: data.team_index,
      roundsPlayed: data.rounds_played,
      roundsWon: data.rounds_won,
      isFullTeamInParty: data.is_full_team_in_party,
      usedTeamRank: data.used_team_rank,
      xpPerRound: data.xp_per_round,
      xpPerRoundWon: data.xp_per_round_won,
      match: this.mapToMatch(data.spectre_match)
    }
  }

  private mapToMatch(data: any): Match {
    return {
      id: data.id,
      matchDate: data.match_date ? new Date(data.match_date) : null,
      isRanked: data.is_ranked,
      isAbandonedMatch: data.is_abandoned_match,
      queueName: data.queue_name,
      queueGameMode: data.queue_game_mode,
      queueGameMap: data.queue_game_map,
      region: data.region,
      surrenderedTeam: data.surrendered_team
    }
  }

  /**
   * Create a new player
   */
  async createPlayer(player: Omit<Player, 'id' | 'createdAt' | 'updatedAt'>) {
    // Generate a UUID if not provided
    const playerId = randomUUID()
    
    // Convert to database format
    const dbPlayer = {
      id: playerId,
      display_name: player.displayName,
      discriminator: player.discriminator,
      crew_id: player.crew?.id || null,
      created_at: new Date().toISOString()
    }
    
    // Insert the player
    const { error } = await this.client
      .from('spectre_player')
      .insert(dbPlayer)
    
    if (error) {
      throw new DatabaseError('Failed to create player', { cause: error })
    }
    
    // If player stats are provided, create them
    if (player.stats) {
      await this.updatePlayerStats(playerId, player.stats)
    }
    
    // If player banner is provided, create it
    if (player.banner) {
      await this.updatePlayerBanner(playerId, player.banner)
    }
    
    // If player accounts are provided, create them
    if (player.accounts && player.accounts.length > 0) {
      await this.createPlayerAccounts(playerId, player.accounts)
    }
    
    return this.getPlayer(playerId)
  }
  
  /**
   * Create player accounts
   */
  async createPlayerAccounts(playerId: string, accounts: PlayerAccount[]) {
    const dbAccounts = accounts.map(account => ({
      player: playerId,
      account_id: account.accountId,
      display_name: account.displayName,
      provider_type: account.providerType,
      created_at: new Date().toISOString()
    }))
    
    const { error } = await this.client
      .from('spectre_player_account')
      .insert(dbAccounts)
    
    if (error) {
      throw new DatabaseError('Failed to create player accounts', { cause: error })
    }
  }

  /**
   * Delete a player and all related data
   */
  async deletePlayer(playerId: string) {
    // Delete player accounts
    await this.client
      .from('spectre_player_account')
      .delete()
      .eq('player', playerId)
    
    // Delete player banner
    await this.client
      .from('spectre_player_banner')
      .delete()
      .eq('player', playerId)
    
    // Delete player stats
    await this.client
      .from('spectre_player_stats')
      .delete()
      .eq('player', playerId)
    
    // Delete team memberships
    await this.client
      .from('spectre_team_member')
      .delete()
      .eq('player', playerId)
    
    // Delete match players
    await this.client
      .from('spectre_match_player')
      .delete()
      .eq('player', playerId)
    
    // Finally delete the player
    const { error } = await this.client
      .from('spectre_player')
      .delete()
      .eq('id', playerId)
    
    if (error) {
      throw new DatabaseError('Failed to delete player', { cause: error })
    }
    
    return true
  }

  /**
   * Search for players by display name
   */
  async searchPlayersByName(name: string, limit = 10): Promise<Player[]> {
    // Use the built-in search_players_by_display_name function
    const { data, error } = await this.client
      .rpc('search_players_by_display_name', { name })
      .limit(limit)
    
    if (error) {
      throw new DatabaseError('Failed to search players', { cause: error })
    }
    
    // For each player found, fetch their complete data
    const players: Player[] = []
    for (const playerData of data || []) {
      try {
        const player = await this.getPlayer(playerData.id)
        players.push(player)
      } catch (err) {
        console.error(`Failed to fetch player ${playerData.id}:`, err)
      }
    }
    
    return players
  }

  public getClient() {
    return this.client;
  }

  /**
   * Upsert a player (create if not exists, update if exists)
   * This handles all related entities in a single operation
   */
  async upsertPlayer(player: Player) {
    // Convert from domain model to database format
    const dbPlayer = this.playerToDbFormat(player);
    
    // Upsert the player record
    const { error } = await this.client
      .from('spectre_player')
      .upsert({
        ...dbPlayer,
        created_at: new Date().toISOString() // This will be ignored on update
      }, { onConflict: 'id' });
    
    if (error) {
      throw new DatabaseError('Failed to upsert player', { cause: error });
    }
    
    // Handle related entities
    if (player.stats) {
      await this.upsertPlayerStats(player.id, player.stats);
    }
    
    if (player.banner) {
      await this.upsertPlayerBanner(player.id, player.banner);
    }
    
    if (player.accounts && player.accounts.length > 0) {
      await this.upsertPlayerAccounts(player.id, player.accounts);
    }
    
    return this.getPlayer(player.id); // Return the updated player
  }

  /**
   * Upsert player stats
   */
  async upsertPlayerStats(playerId: string, stats: PlayerStats) {
    const dbStats = {
      player: playerId,
      current_solo_rank: stats.currentSoloRank,
      highest_team_rank: stats.highestTeamRank,
      rank_rating: stats.rankRating,
      last_updated_rank_rating: stats.lastUpdatedRankRating ? stats.lastUpdatedRankRating.toISOString() : null,
      updated_at: new Date().toISOString(),
      created_at: new Date().toISOString() // This will be ignored on update
    };
    
    const { error } = await this.client
      .from('spectre_player_stats')
      .upsert(dbStats, { onConflict: 'player' });
    
    if (error) {
      throw new DatabaseError('Failed to upsert player stats', { cause: error });
    }
  }
  
  /**
   * Upsert player banner
   */
  async upsertPlayerBanner(playerId: string, banner: PlayerBanner) {
    const dbBanner = {
      player: playerId,
      item_instance_id: banner.itemInstanceId,
      item_catalog_id: banner.itemCatalogId,
      item_type: banner.itemType,
      alteration_data: banner.alterationData,
      attachment_item_instance_id: banner.attachmentItemInstanceId,
      attachment_item_catalog_id: banner.attachmentItemCatalogId,
      updated_at: new Date().toISOString(),
      created_at: new Date().toISOString() // This will be ignored on update
    };
    
    const { error } = await this.client
      .from('spectre_player_banner')
      .upsert(dbBanner, { onConflict: 'player' });
    
    if (error) {
      throw new DatabaseError('Failed to upsert player banner', { cause: error });
    }
  }
  
  /**
   * Upsert player accounts
   */
  async upsertPlayerAccounts(playerId: string, accounts: PlayerAccount[]) {
    if (accounts.length === 0) return;
    
    const dbAccounts = accounts.map(account => ({
      id: account.id,
      player: playerId,
      account_id: account.accountId,
      display_name: account.displayName,
      provider_type: account.providerType,
      updated_at: new Date().toISOString(),
      created_at: new Date().toISOString() // This will be ignored on update
    }));
    
    const { error } = await this.client
      .from('spectre_player_account')
      .upsert(dbAccounts, { onConflict: 'id' });
    
    if (error) {
      throw new DatabaseError('Failed to upsert player accounts', { cause: error });
    }
  }

  /**
   * Upsert a crew (create if not exists, update if exists)
   */
  async upsertCrew(crew: Crew) {
    const dbCrew = {
      id: crew.id,
      name: crew.name,
      home_turf: crew.homeTurf,
      total_score: crew.totalScore,
      division_id: crew.divisionId,
      updated_at: new Date().toISOString(),
      created_at: new Date().toISOString() // This will be ignored on update
    };
    
    const { error } = await this.client
      .from('spectre_crew')
      .upsert(dbCrew, { onConflict: 'id' });
    
    if (error) {
      throw new DatabaseError('Failed to upsert crew', { cause: error });
    }
    
    return crew;
  }

  /**
   * Upsert a division (create if not exists, update if exists)
   */
  async upsertDivision(division: Division) {
    const dbDivision = {
      id: division.id,
      name: division.name,
      type: division.type,
      updated_at: new Date().toISOString(),
      created_at: new Date().toISOString() // This will be ignored on update
    };
    
    const { error } = await this.client
      .from('spectre_division')
      .upsert(dbDivision, { onConflict: 'id' });
    
    if (error) {
      throw new DatabaseError('Failed to upsert division', { cause: error });
    }
    
    return division;
  }

  /**
   * Upsert a team (create if not exists, update if exists)
   */
  async upsertTeam(team: Team) {
    const dbTeam = {
      id: team.id,
      team_name: team.teamName,
      team_size: team.teamSize,
      team_data: team.teamData,
      last_played: team.lastPlayed ? team.lastPlayed.toISOString() : null,
      updated_at: new Date().toISOString(),
      created_at: new Date().toISOString() // This will be ignored on update
    };
    
    const { error } = await this.client
      .from('spectre_team')
      .upsert(dbTeam, { onConflict: 'id' });
    
    if (error) {
      throw new DatabaseError('Failed to upsert team', { cause: error });
    }
    
    return team;
  }

  /**
   * Upsert a team membership
   */
  async upsertTeamMembership(playerId: string, teamMembership: TeamMembership) {
    const dbTeamMembership = {
      id: teamMembership.id,
      player: playerId,
      team: teamMembership.team.id,
      updated_at: new Date().toISOString(),
      created_at: new Date().toISOString() // This will be ignored on update
    };
    
    const { error } = await this.client
      .from('spectre_team_member')
      .upsert(dbTeamMembership, { onConflict: 'id' });
    
    if (error) {
      throw new DatabaseError('Failed to upsert team membership', { cause: error });
    }
  }

  /**
   * Upsert a match
   */
  async upsertMatch(match: Match) {
    const dbMatch = {
      id: match.id,
      match_date: match.matchDate ? match.matchDate.toISOString() : null,
      is_ranked: match.isRanked,
      is_abandoned_match: match.isAbandonedMatch,
      queue_name: match.queueName,
      queue_game_mode: match.queueGameMode,
      queue_game_map: match.queueGameMap,
      region: match.region,
      surrendered_team: match.surrenderedTeam,
      raw_match_data: {}, // Add empty object for required field
      updated_at: new Date().toISOString(),
      created_at: new Date().toISOString() // This will be ignored on update
    };
    
    const { error } = await this.client
      .from('spectre_match')
      .upsert(dbMatch, { onConflict: 'id' });
    
    if (error) {
      throw new DatabaseError('Failed to upsert match', { cause: error });
    }
    
    return match;
  }

  /**
   * Upsert a match team
   */
  async upsertMatchTeam(matchTeam: MatchTeam) {
    const dbMatchTeam = {
      id: matchTeam.id,
      team_index: matchTeam.teamIndex,
      rounds_played: matchTeam.roundsPlayed,
      rounds_won: matchTeam.roundsWon,
      is_full_team_in_party: matchTeam.isFullTeamInParty,
      used_team_rank: matchTeam.usedTeamRank,
      xp_per_round: matchTeam.xpPerRound,
      xp_per_round_won: matchTeam.xpPerRoundWon,
      match: matchTeam.match.id,
      updated_at: new Date().toISOString(),
      created_at: new Date().toISOString() // This will be ignored on update
    };
    
    const { error } = await this.client
      .from('spectre_match_team')
      .upsert(dbMatchTeam, { onConflict: 'id' });
    
    if (error) {
      throw new DatabaseError('Failed to upsert match team', { cause: error });
    }
    
    return matchTeam;
  }

  /**
   * Upsert a match player
   */
  async upsertMatchPlayer(matchPlayer: MatchPlayer) {
    const dbMatchPlayer = {
      id: matchPlayer.id,
      player: matchPlayer.id.toString(), // Assuming this is the player ID
      saved_player_name: matchPlayer.savedPlayerName,
      saved_sponsor_name: matchPlayer.savedSponsorName,
      selected_sponsor: matchPlayer.selectedSponsor,
      selected_banner_catalog_id: matchPlayer.selectedBannerCatalogId,
      num_kills: matchPlayer.numKills,
      num_deaths: matchPlayer.numDeaths,
      num_assists: matchPlayer.numAssists,
      total_damage_done: matchPlayer.totalDamageDeone,
      current_rank_id: matchPlayer.currentRankId,
      previous_rank_id: matchPlayer.previousRankId,
      current_ranked_rating: matchPlayer.currentRankedRating,
      previous_ranked_rating: matchPlayer.previousRankedRating,
      num_ranked_matches: matchPlayer.numRankedMatches,
      is_anonymous_player: matchPlayer.isAnonymousPlayer,
      teammate_index: matchPlayer.teammateIndex,
      crew_score: matchPlayer.crewScore,
      team: matchPlayer.team.id,
      updated_at: new Date().toISOString(),
      created_at: new Date().toISOString() // This will be ignored on update
    };
    
    const { error } = await this.client
      .from('spectre_match_player')
      .upsert(dbMatchPlayer, { onConflict: 'id' });
    
    if (error) {
      throw new DatabaseError('Failed to upsert match player', { cause: error });
    }
    
    return matchPlayer;
  }

  /**
   * Process a match dump with all related entities
   * This handles the complex relationships between match, teams, and players
   */
  async processMatchDump(matchData: any) {
    try {
      // 1. Extract and upsert divisions first
      const divisions = this.extractDivisionsFromMatch(matchData);
      for (const division of divisions) {
        await this.upsertDivision(division);
      }
      
      // 2. Extract and upsert crews
      const crews = this.extractCrewsFromMatch(matchData);
      for (const crew of crews) {
        await this.upsertCrew(crew);
      }
      
      // 3. Extract and upsert teams
      const teams = this.extractTeamsFromMatch(matchData);
      for (const team of teams) {
        await this.upsertTeam(team);
      }
      
      // 4. Extract and upsert players
      const players = this.extractPlayersFromMatch(matchData);
      for (const player of players) {
        await this.upsertPlayer(player);
      }
      
      // 5. Process the match itself
      const match = this.extractMatchData(matchData);
      await this.upsertMatch(match);
      
      // 6. Process match teams
      const matchTeams = this.extractMatchTeamsData(matchData, match);
      for (const matchTeam of matchTeams) {
        await this.upsertMatchTeam(matchTeam);
      }
      
      // 7. Process match players
      const matchPlayers = this.extractMatchPlayersData(matchData, matchTeams);
      for (const matchPlayer of matchPlayers) {
        await this.upsertMatchPlayer(matchPlayer);
      }
      
      return {
        success: true,
        matchId: match.id
      };
    } catch (error) {
      throw new DatabaseError('Failed to process match dump', { cause: error });
    }
  }

  /**
   * Extract divisions from match data
   */
  private extractDivisionsFromMatch(matchData: any): Division[] {
    const divisions: Division[] = [];
    
    // Extract divisions from players' crews
    if (matchData.players && Array.isArray(matchData.players)) {
      for (const player of matchData.players) {
        if (player.crew && player.crew.division) {
          const division: Division = {
            id: player.crew.division.id,
            name: player.crew.division.name,
            type: player.crew.division.type
          };
          
          // Check if division already exists in the array
          if (!divisions.some(d => d.id === division.id)) {
            divisions.push(division);
          }
        }
      }
    }
    
    return divisions;
  }

  /**
   * Extract crews from match data
   */
  private extractCrewsFromMatch(matchData: any): Crew[] {
    const crews: Crew[] = [];
    
    // Extract crews from players
    if (matchData.players && Array.isArray(matchData.players)) {
      for (const player of matchData.players) {
        if (player.crew) {
          const crew: Crew = {
            id: player.crew.id,
            name: player.crew.name,
            homeTurf: player.crew.homeTurf,
            totalScore: player.crew.totalScore || 0,
            divisionId: player.crew.division?.id || null,
            division: player.crew.division ? {
              id: player.crew.division.id,
              name: player.crew.division.name,
              type: player.crew.division.type
            } : null
          };
          
          // Check if crew already exists in the array
          if (!crews.some(c => c.id === crew.id)) {
            crews.push(crew);
          }
        }
      }
    }
    
    return crews;
  }

  /**
   * Extract teams from match data
   */
  private extractTeamsFromMatch(matchData: any): Team[] {
    const teams: Team[] = [];
    
    // Extract teams from match teams
    if (matchData.teams && Array.isArray(matchData.teams)) {
      for (const team of matchData.teams) {
        if (team.teamId) {
          const teamEntity: Team = {
            id: team.teamId,
            teamName: team.teamName || `Team ${team.teamIndex}`,
            teamSize: team.players?.length || 0,
            teamData: team.teamData || null,
            lastPlayed: matchData.matchDate ? new Date(matchData.matchDate) : null
          };
          
          // Check if team already exists in the array
          if (!teams.some(t => t.id === teamEntity.id)) {
            teams.push(teamEntity);
          }
        }
      }
    }
    
    return teams;
  }

  /**
   * Extract players from match data
   */
  private extractPlayersFromMatch(matchData: any): Player[] {
    const players: Player[] = [];
    
    // Extract players from match players
    if (matchData.players && Array.isArray(matchData.players)) {
      for (const player of matchData.players) {
        if (player.id) {
          const playerEntity: Player = {
            id: player.id,
            displayName: player.displayName || player.savedPlayerName,
            discriminator: player.discriminator || '',
            createdAt: new Date(),
            updatedAt: new Date(),
            crew: player.crew ? {
              id: player.crew.id,
              name: player.crew.name,
              homeTurf: player.crew.homeTurf,
              totalScore: player.crew.totalScore || 0,
              divisionId: player.crew.division?.id || null
            } : null,
            stats: player.stats ? {
              currentSoloRank: player.stats.currentSoloRank || 0,
              highestTeamRank: player.stats.highestTeamRank || 0,
              rankRating: player.stats.rankRating || null,
              lastUpdatedRankRating: player.stats.lastUpdatedRankRating ? new Date(player.stats.lastUpdatedRankRating) : null
            } : null,
            banner: player.banner ? {
              itemInstanceId: player.banner.itemInstanceId,
              itemCatalogId: player.banner.itemCatalogId || null,
              itemType: player.banner.itemType || 'unknown',
              alterationData: player.banner.alterationData || null,
              attachmentItemInstanceId: player.banner.attachmentItemInstanceId || null,
              attachmentItemCatalogId: player.banner.attachmentItemCatalogId || null
            } : null,
            accounts: player.accounts ? player.accounts.map((account: any) => ({
              id: account.id || `${player.id}-${account.providerType}`,
              accountId: account.accountId,
              displayName: account.displayName || player.displayName,
              providerType: account.providerType
            })) : []
          };
          
          // Check if player already exists in the array
          if (!players.some(p => p.id === playerEntity.id)) {
            players.push(playerEntity);
          }
        }
      }
    }
    
    return players;
  }

  /**
   * Extract match data
   */
  private extractMatchData(matchData: any): Match {
    return {
      id: matchData.id,
      matchDate: matchData.matchDate ? new Date(matchData.matchDate) : null,
      isRanked: matchData.isRanked || false,
      isAbandonedMatch: matchData.isAbandonedMatch || false,
      queueName: matchData.queueName || null,
      queueGameMode: matchData.queueGameMode || null,
      queueGameMap: matchData.queueGameMap || null,
      region: matchData.region || null,
      surrenderedTeam: matchData.surrenderedTeam || null
    };
  }

  /**
   * Extract match teams data
   */
  private extractMatchTeamsData(matchData: any, match: Match): MatchTeam[] {
    const matchTeams: MatchTeam[] = [];
    
    if (matchData.teams && Array.isArray(matchData.teams)) {
      for (const team of matchData.teams) {
        const matchTeam: MatchTeam = {
          id: team.id || `${match.id}-team-${team.teamIndex}`,
          teamIndex: team.teamIndex,
          roundsPlayed: team.roundsPlayed || 0,
          roundsWon: team.roundsWon || 0,
          isFullTeamInParty: team.isFullTeamInParty || false,
          usedTeamRank: team.usedTeamRank || false,
          xpPerRound: team.xpPerRound || 0,
          xpPerRoundWon: team.xpPerRoundWon || 0,
          match: match
        };
        
        matchTeams.push(matchTeam);
      }
    }
    
    return matchTeams;
  }

  /**
   * Extract match players data
   */
  private extractMatchPlayersData(matchData: any, matchTeams: MatchTeam[]): MatchPlayer[] {
    const matchPlayers: MatchPlayer[] = [];
    
    if (matchData.players && Array.isArray(matchData.players)) {
      for (const player of matchData.players) {
        // Find the match team for this player
        const matchTeam = matchTeams.find(team => team.teamIndex === player.teamIndex);
        
        if (matchTeam) {
          const matchPlayer: MatchPlayer = {
            id: player.matchPlayerId || parseInt(`${matchTeam.match.id}${player.id}`.substring(0, 9)),
            savedPlayerName: player.savedPlayerName || player.displayName,
            savedSponsorName: player.savedSponsorName || '',
            selectedSponsor: player.selectedSponsor || '',
            selectedBannerCatalogId: player.selectedBannerCatalogId || '',
            numKills: player.numKills || 0,
            numDeaths: player.numDeaths || 0,
            numAssists: player.numAssists || 0,
            totalDamageDeone: player.totalDamageDeone || 0,
            currentRankId: player.currentRankId || 0,
            previousRankId: player.previousRankId || 0,
            currentRankedRating: player.currentRankedRating || 0,
            previousRankedRating: player.previousRankedRating || 0,
            numRankedMatches: player.numRankedMatches || 0,
            isAnonymousPlayer: player.isAnonymousPlayer || false,
            teammateIndex: player.teammateIndex || 0,
            crewScore: player.crewScore || 0,
            team: matchTeam
          };
          
          matchPlayers.push(matchPlayer);
        }
      }
    }
    
    return matchPlayers;
  }

  /**
   * Process a batch of players
   */
  async batchUpsertPlayers(players: Player[]) {
    // Extract unique players by ID
    const uniquePlayersMap = new Map<string, Player>();
    players.forEach(player => uniquePlayersMap.set(player.id, player));
    const uniquePlayers = Array.from(uniquePlayersMap.values());
    
    for (const player of uniquePlayers) {
      await this.upsertPlayer(player);
    }
    
    return uniquePlayers.length;
  }

  /**
   * Process a batch of crews
   */
  async batchUpsertCrews(crews: Crew[]) {
    // Extract unique crews by ID
    const uniqueCrewsMap = new Map<string, Crew>();
    crews.forEach(crew => uniqueCrewsMap.set(crew.id, crew));
    const uniqueCrews = Array.from(uniqueCrewsMap.values());
    
    for (const crew of uniqueCrews) {
      await this.upsertCrew(crew);
    }
    
    return uniqueCrews.length;
  }

  /**
   * Process a batch of divisions
   */
  async batchUpsertDivisions(divisions: Division[]) {
    // Extract unique divisions by ID
    const uniqueDivisionsMap = new Map<string, Division>();
    divisions.forEach(division => uniqueDivisionsMap.set(division.id, division));
    const uniqueDivisions = Array.from(uniqueDivisionsMap.values());
    
    for (const division of uniqueDivisions) {
      await this.upsertDivision(division);
    }
    
    return uniqueDivisions.length;
  }

  /**
   * Process a batch of teams
   */
  async batchUpsertTeams(teams: Team[]) {
    // Extract unique teams by ID
    const uniqueTeamsMap = new Map<string, Team>();
    teams.forEach(team => uniqueTeamsMap.set(team.id, team));
    const uniqueTeams = Array.from(uniqueTeamsMap.values());
    
    for (const team of uniqueTeams) {
      await this.upsertTeam(team);
    }
    
    return uniqueTeams.length;
  }

  async insertRawMatch(id: string, match: MatchData, date?: string) {
    console.log(`Inserting/updating match ${id} into database`);
    try {
      // Convert Unix timestamp (if provided) to ISO string
      let createdAt: string;
      if (date) {
        // If date is a Unix timestamp (milliseconds)
        const timestamp = parseInt(date);
        if (!isNaN(timestamp)) {
          createdAt = new Date(timestamp).toISOString();
        } else {
          // If it's already an ISO string or other format
          createdAt = date;
        }
      } else {
        createdAt = new Date().toISOString();
      }
      
      // Log the structure of the data being inserted
      console.log(`Match data structure:`, {
        id,
        matchDataType: typeof match,
        hasMatchId: !!match?.matchId,
        createdAt
      });
      
      // Use upsert instead of insert to handle existing records
      const { data, error } = await this.client
        .from('spectre_match_json')
        .upsert([{
          id: id,
          match_data: match as unknown as any,
          created_at: createdAt
        }], {
          onConflict: 'id',  // Specify the conflict column
          ignoreDuplicates: false  // Update the record if it exists
        })
        .select();
      
      if (error) {
        console.error(`Database error upserting match ${id}:`, {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        throw new DatabaseError(`Failed to upsert match ${id}: ${error.message}`, { cause: error });
      }
      
      console.log(`Successfully upserted match ${id}`);
      return data;
    } catch (error: any) {
      console.error(`Unexpected error upserting match ${id}:`, {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      
      // If it's a PostgreSQL error, it might have more details
      if (error.code) {
        console.error('PostgreSQL error details:', {
          code: error.code,
          detail: error.detail,
          hint: error.hint,
          constraint: error.constraint
        });
      }
      
      throw new DatabaseError(`Failed to upsert match ${id}: ${error.message}`, { cause: error });
    }
  }

  async getRawMatch(id: string) {
    const { data, error } = await this.client.from('spectre_match_json').select('*').eq('id', id).single();
    if (error) {
      throw new DatabaseError('Failed to get match', { cause: error });
    }
    return data;
  }
}

// Custom error types
export class DatabaseError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options)
    this.name = 'DatabaseError'
  }
}