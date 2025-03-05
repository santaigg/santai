import PulseFinder from '@repo/pulsefinder-sdk';
import { logger } from "@trigger.dev/sdk/v3";
import type {
  DumpPlayerActivityInput,
  DumpCrewActivityInput,
  DumpDivisionActivityInput,
  DumpTeamActivityInput,
  DumpMatchActivityInput,
  DumpPlayerTeamsActivityInput,
  DumpTeamMatchesActivityInput,
  DumpPlayerMatchesActivityInput,
  DumpResult
} from './interfaces';
import { crewDumpTask, divisionDumpTask, teamDumpTask, matchDumpTask, playerDumpTask } from './tasks';
import { PlayerIdentity } from '@repo/pulsefinder-types';
// Import the database client and types
import { DatabaseService } from '@repo/database';
// Import types from database package
// import type { Player, PlayerStats, PlayerAccount } from '@repo/database';

// Initialize the PulseFinder SDK
const pulsefinder = new PulseFinder({
  apiKey: process.env.PULSEFINDER_API_KEY,
  baseUrl: process.env.PULSEFINDER_API_URL
});

/**
 * Activity to dump player data
 */
export async function dumpPlayerActivity(input: DumpPlayerActivityInput): Promise<DumpResult> {
  try {
    const { playerId } = input;
    logger.log(`Dumping player data for player ID: ${playerId}`);
    
    // Fetch player profile using the SDK
    const playerResponse = await pulsefinder.player.getBulkProfiles([playerId]);
    
    if(!playerResponse.data || playerResponse.data.length === 0) {
      logger.error(`No player data found for player ${playerId}`);
      return {
        success: false,
        entityId: playerId,
        entityType: 'player',
        error: 'No player data found',
        timestamp: new Date().toISOString()
      };
    }
    
    const playerData = playerResponse.data[0]
    const playerIdentityResponse = await pulsefinder.player.getSocialConnections(playerId);
    let playerIdentity: PlayerIdentity | undefined;
    if(playerIdentityResponse.data) {
      playerIdentity = playerIdentityResponse.data
    }
    if (playerData.crewId) {
      logger.log(`Player ${playerId} belongs to crew ${playerData.crewId}, triggering crew dump`);
      await crewDumpTask.triggerAndWait({ crewId: playerData.crewId });
    }

    // Dump Data to Database
    const db = new DatabaseService(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);
    
    // Create player object from API data
    const player = {
      id: playerData.playerId,
      displayName: playerData.displayName.displayName || '',
      discriminator: playerData.displayName.discriminator || '',
      createdAt: new Date(),
      updatedAt: new Date(),
      
      // Add crew if available
      crew: playerData.crewId ? {
        id: playerData.crewId,
        name: playerData.crewName || 'Unknown Crew',
        homeTurf: playerData.crewHomeTurf || null,
        totalScore: playerData.crewTotalScore || 0,
        divisionId: playerData.crewDivisionId || null
      } : null,
      
      // Add stats if available
      stats: {
        currentSoloRank: playerData.currentSoloRank || 0,
        highestTeamRank: playerData.highestTeamRank || 0,
        rankRating: playerData.rankRating || null,
        lastUpdatedRankRating: playerData.lastUpdatedRankRating ? new Date(playerData.lastUpdatedRankRating) : null
      },
      
      // Add banner if available
      banner: playerData.banner ? {
        itemInstanceId: playerData.banner.itemInstanceId || '',
        itemCatalogId: playerData.banner.itemCatalogId || null,
        itemType: playerData.banner.itemType || 'unknown',
        alterationData: playerData.banner.alterationData || null,
        attachmentItemInstanceId: playerData.banner.attachmentItemInstanceId || null,
        attachmentItemCatalogId: playerData.banner.attachmentItemCatalogId || null
      } : null,
      
      // Add accounts if available
      accounts: playerIdentity ? playerIdentity.connections.map((connection: any) => ({
        id: `${playerId}-${connection.providerType}`,
        accountId: connection.accountId,
        displayName: connection.displayName || playerData.displayName || '',
        providerType: connection.providerType
      })) : []
    };
    
    // Upsert player to database
    await (db as any).upsertPlayer(player);
    
    return {
      success: true,
      entityId: playerId,
      entityType: 'player',
      message: `Successfully dumped player data for player ${playerId}`,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    logger.error(`Error dumping player data:`, error);
    return {
      success: false,
      entityId: input.playerId,
      entityType: 'player',
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Activity to dump crew data
 */
export async function dumpCrewActivity(input: DumpCrewActivityInput): Promise<DumpResult> {
  try {
    const { crewId } = input;
    logger.log(`Dumping crew data for crew ID: ${crewId}`);
    
    // Fetch crew data using the SDK
    const crewResponse = await pulsefinder.crew.getCrew(crewId);

    if(!crewResponse.data) {
      logger.error(`No crew data found for crew ${crewId}`);
      return {
        success: false,
        entityId: crewId,
        entityType: 'crew',
        error: 'No crew data found',
        timestamp: new Date().toISOString()
      };
    }

    const crewData = crewResponse.data;

    const divisionResponse = await pulsefinder.division.getCrewDivision(crewId);
    if(!divisionResponse.data) {
      logger.error(`No division data found for crew ${crewId}`);
      return {
        success: false,
        entityId: crewId,
        entityType: 'crew',
        error: 'No division data found',
        timestamp: new Date().toISOString()
      };
    }

    const divisionData = divisionResponse.data; 
    // Check if crew has a division and trigger division dump
    if (divisionData) {
      logger.log(`Crew ${crewId} belongs to division ${divisionData.divisionId}, triggering division dump`);
      await divisionDumpTask.triggerAndWait({ divisionId: divisionData.divisionId });
    }


    // TODO: Dump Data to Database
    
    return {
      success: true,
      entityId: crewId,
      entityType: 'crew',
      message: `Successfully dumped crew data for crew ${crewId}`,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    logger.error(`Error dumping crew data:`, error);
    return {
      success: false,
      entityId: input.crewId,
      entityType: 'crew',
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Activity to dump division data
 */
export async function dumpDivisionActivity(input: DumpDivisionActivityInput): Promise<DumpResult> {
  try {
    const { divisionId } = input;
    logger.log(`Dumping division data for division ID: ${divisionId}`);
    
    // Fetch division data using the SDK
    const divisionResponse = await pulsefinder.division.getDivision(divisionId);
    
    // In a real implementation, you might store this data in a database
    logger.log(`Successfully dumped division data for division ${divisionId}`);
    
    // If division has teams, trigger team dumps
    try {
      const teamsResponse = await pulsefinder.division.getDivisionTeams(divisionId);
      const teams = teamsResponse as any[];
      
      if (teams && Array.isArray(teams) && teams.length > 0) {
        for (const team of teams) {
          logger.log(`Processing division team: ${team.id}`);
          // We don't await this to avoid long-running tasks
          teamDumpTask.trigger({ 
            teamId: team.id,
            playerIds: team.members?.map((member: any) => member.playerId) || []
          });
        }
      }
    } catch (error) {
      logger.error(`Error fetching division teams: ${error}`);
    }
    
    return {
      success: true,
      entityId: divisionId,
      entityType: 'division',
      message: `Successfully dumped division data for division ${divisionId}`,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    logger.error(`Error dumping division data:`, error);
    return {
      success: false,
      entityId: input.divisionId,
      entityType: 'division',
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Activity to dump team data
 */
export async function dumpTeamActivity(input: DumpTeamActivityInput): Promise<DumpResult> {
  try {
    const { teamId, playerIds } = input;
    logger.log(`Dumping team data for team ID: ${teamId}`);
    
    // Fetch team data using the SDK
    const teamResponse = await pulsefinder.team.getTeam(teamId);
    
    // In a real implementation, you might store this data in a database
    logger.log(`Successfully dumped team data for team ${teamId}`);
    
    // Using type assertion since we know the structure from the old backend
    const teamData = teamResponse as any;
    
    // If team has members and they weren't provided in the input, trigger player dumps
    if (teamData.members && Array.isArray(teamData.members) && teamData.members.length > 0 && (!playerIds || playerIds.length === 0)) {
      for (const member of teamData.members) {
        if (member.playerId) {
          logger.log(`Processing team member: ${member.playerId}`);
          // We don't await this to avoid long-running tasks
          playerDumpTask.trigger({ playerId: member.playerId });
        }
      }
    }
    
    return {
      success: true,
      entityId: teamId,
      entityType: 'team',
      message: `Successfully dumped team data for team ${teamId}`,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    logger.error(`Error dumping team data:`, error);
    return {
      success: false,
      entityId: input.teamId,
      entityType: 'team',
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Activity to dump match data
 */
export async function dumpMatchActivity(input: DumpMatchActivityInput): Promise<DumpResult> {
  try {
    const { matchId } = input;
    logger.log(`Dumping match data for match ID: ${matchId}`);
    
    // Fetch match data using the SDK
    const matchResponse = await (pulsefinder.match as any).getMatchDetails(matchId);
    
    if (!matchResponse.data) {
      logger.error(`No match data found for match ${matchId}`);
      return {
        success: false,
        entityId: matchId,
        entityType: 'match',
        error: 'No match data found',
        timestamp: new Date().toISOString()
      };
    }
    
    const matchData = matchResponse.data as any;
    
    // Dump Data to Database
    const db = new DatabaseService(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);
    
    // Process the match dump with all related entities
    await (db as any).processMatchDump(matchData);
    
    return {
      success: true,
      entityId: matchId,
      entityType: 'match',
      message: `Successfully dumped match data for match ${matchId}`,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    logger.error(`Error dumping match data:`, error);
    return {
      success: false,
      entityId: input.matchId,
      entityType: 'match',
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Activity to dump player teams
 */
export async function dumpPlayerTeamsActivity(input: DumpPlayerTeamsActivityInput): Promise<DumpResult> {
  try {
    const { playerId } = input;
    logger.log(`Dumping teams for player ID: ${playerId}`);
    
    // Fetch player teams using the SDK
    const teamsResponse = await pulsefinder.player.getPlayerTeams(playerId);
    const teams = teamsResponse as any[];
    
    logger.log(`Successfully dumped ${teams.length} teams for player ${playerId}`);
    
    // Trigger team dumps for each team
    for (const team of teams) {
      logger.log(`Triggering team dump for team: ${team.id}`);
      await teamDumpTask.trigger({ 
        teamId: team.id,
        playerIds: team.members?.map((member: any) => member.playerId) || []
      });
    }
    
    return {
      success: true,
      entityId: playerId,
      entityType: 'player_teams',
      message: `Successfully dumped ${teams.length} teams for player ${playerId}`,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    logger.error(`Error dumping player teams:`, error);
    return {
      success: false,
      entityId: input.playerId,
      entityType: 'player_teams',
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Activity to dump team matches
 */
export async function dumpTeamMatchesActivity(input: DumpTeamMatchesActivityInput): Promise<DumpResult> {
  try {
    const { teamId } = input;
    logger.log(`Dumping matches for team ID: ${teamId}`);
    
    // Fetch team matches using the SDK
    const matchesResponse = await pulsefinder.team.getTeamMatches(teamId);
    const matches = matchesResponse as any[];
    
    logger.log(`Successfully dumped ${matches.length} matches for team ${teamId}`);
    
    // Trigger match dumps for each match
    for (const match of matches) {
      logger.log(`Triggering match dump for match: ${match.id}`);
      await matchDumpTask.trigger({ matchId: match.id });
    }
    
    return {
      success: true,
      entityId: teamId,
      entityType: 'team_matches',
      message: `Successfully dumped ${matches.length} matches for team ${teamId}`,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    logger.error(`Error dumping team matches:`, error);
    return {
      success: false,
      entityId: input.teamId,
      entityType: 'team_matches',
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Activity to dump player matches
 */
export async function dumpPlayerMatchesActivity(input: DumpPlayerMatchesActivityInput): Promise<DumpResult> {
  try {
    const { playerId } = input;
    logger.log(`Dumping matches for player ID: ${playerId}`);
    
    // Fetch player matches using the SDK
    const matchesResponse = await pulsefinder.player.getPlayerMatches(playerId);
    const matches = matchesResponse as any[];
    
    logger.log(`Successfully dumped ${matches.length} matches for player ${playerId}`);
    
    // Trigger match dumps for each match
    for (const match of matches) {
      logger.log(`Triggering match dump for match: ${match.id}`);
      await matchDumpTask.trigger({ matchId: match.id });
    }
    
    return {
      success: true,
      entityId: playerId,
      entityType: 'player_matches',
      message: `Successfully dumped ${matches.length} matches for player ${playerId}`,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    logger.error(`Error dumping player matches:`, error);
    return {
      success: false,
      entityId: input.playerId,
      entityType: 'player_matches',
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    };
  }
} 