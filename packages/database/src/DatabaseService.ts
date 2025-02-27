import { createClient, SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../database.types' // Generated Supabase types
import { 
  Player, Crew, Division, PlayerStats, PlayerBanner, 
  PlayerAccount, TeamMembership, Team, MatchPlayer, 
  MatchTeam, Match 
} from './models'
import { randomUUID } from 'crypto'

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
}

// Custom error types
export class DatabaseError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options)
    this.name = 'DatabaseError'
  }
}