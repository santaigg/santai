import { logger, task, batch } from "@trigger.dev/sdk/v3";
import type {
  PlayerDumpTaskInput,
  CrewDumpTaskInput,
  DivisionDumpTaskInput,
  TeamDumpTaskInput,
  MatchDumpTaskInput,
  BulkDumpTaskInput,
  DumpResult
} from './interfaces';
import * as activities from './activities';

/**
 * Task to dump player data
 */
export const playerDumpTask = task({
  id: "player-dump-task",
  maxDuration: 300, // 5 minutes
  run: async (input: PlayerDumpTaskInput): Promise<DumpResult[]> => {
    const results: DumpResult[] = [];
    
    // Dump player profile
    const playerResult = await activities.dumpPlayerActivity({ playerId: input.playerId });
    results.push(playerResult);
    
    if (playerResult.success) {
      // Dump player teams
      const teamsResult = await activities.dumpPlayerTeamsActivity({ playerId: input.playerId });
      results.push(teamsResult);
      
      // Dump player matches
      const matchesResult = await activities.dumpPlayerMatchesActivity({ playerId: input.playerId });
      results.push(matchesResult);
    }
    
    return results;
  },
});

/**
 * Task to dump crew data
 */
export const crewDumpTask = task({
  id: "crew-dump-task",
  maxDuration: 300, // 5 minutes
  run: async (input: CrewDumpTaskInput): Promise<DumpResult[]> => {
    const results: DumpResult[] = [];
    
    // Dump crew data
    const crewResult = await activities.dumpCrewActivity({ crewId: input.crewId });
    results.push(crewResult);
    
    return results;
  },
});

/**
 * Task to dump division data
 */
export const divisionDumpTask = task({
  id: "division-dump-task",
  maxDuration: 300, // 5 minutes
  run: async (input: DivisionDumpTaskInput): Promise<DumpResult[]> => {
    const results: DumpResult[] = [];
    
    // Dump division data
    const divisionResult = await activities.dumpDivisionActivity({ divisionId: input.divisionId });
    results.push(divisionResult);
    
    return results;
  },
});

/**
 * Task to dump team data
 */
export const teamDumpTask = task({
  id: "team-dump-task",
  maxDuration: 300, // 5 minutes
  run: async (input: TeamDumpTaskInput): Promise<DumpResult[]> => {
    const results: DumpResult[] = [];
    
    // Dump team data
    const teamResult = await activities.dumpTeamActivity({ 
      teamId: input.teamId,
      playerIds: input.playerIds
    });
    results.push(teamResult);
    
    if (teamResult.success) {
      // Dump team matches
      const matchesResult = await activities.dumpTeamMatchesActivity({ teamId: input.teamId });
      results.push(matchesResult);
    }
    
    return results;
  },
});

/**
 * Task to dump match data
 */
export const matchDumpTask = task({
  id: "match-dump-task",
  maxDuration: 300, // 5 minutes
  run: async (input: MatchDumpTaskInput): Promise<DumpResult[]> => {
    const results: DumpResult[] = [];
    
    // Dump match data
    const matchResult = await activities.dumpMatchActivity({ matchId: input.matchId });
    results.push(matchResult);
    
    return results;
  },
});

/**
 * Task to dump data in bulk
 */
export const bulkDumpTask = task({
  id: "bulk-dump-task",
  maxDuration: 1800, // 30 minutes
  run: async (input: BulkDumpTaskInput): Promise<DumpResult[]> => {
    const allResults: DumpResult[] = [];
    
    // Process players
    if (input.playerIds && input.playerIds.length > 0) {
      for (const playerId of input.playerIds) {
        logger.log(`Processing player: ${playerId}`);
        const result = await batch.triggerByTaskAndWait([
          { task: playerDumpTask, payload: { playerId } }
        ]);
        
        if (result.runs[0].ok) {
          allResults.push(...result.runs[0].output);
        }
      }
    }
    
    // Process crews
    if (input.crewIds && input.crewIds.length > 0) {
      for (const crewId of input.crewIds) {
        logger.log(`Processing crew: ${crewId}`);
        const result = await batch.triggerByTaskAndWait([
          { task: crewDumpTask, payload: { crewId } }
        ]);
        
        if (result.runs[0].ok) {
          allResults.push(...result.runs[0].output);
        }
      }
    }
    
    // Process divisions
    if (input.divisionIds && input.divisionIds.length > 0) {
      for (const divisionId of input.divisionIds) {
        logger.log(`Processing division: ${divisionId}`);
        const result = await batch.triggerByTaskAndWait([
          { task: divisionDumpTask, payload: { divisionId } }
        ]);
        
        if (result.runs[0].ok) {
          allResults.push(...result.runs[0].output);
        }
      }
    }
    
    // Process teams
    if (input.teamIds && input.teamIds.length > 0) {
      for (const teamId of input.teamIds) {
        logger.log(`Processing team: ${teamId}`);
        const result = await batch.triggerByTaskAndWait([
          { task: teamDumpTask, payload: { teamId } }
        ]);
        
        if (result.runs[0].ok) {
          allResults.push(...result.runs[0].output);
        }
      }
    }
    
    // Process matches
    if (input.matchIds && input.matchIds.length > 0) {
      for (const matchId of input.matchIds) {
        logger.log(`Processing match: ${matchId}`);
        const result = await batch.triggerByTaskAndWait([
          { task: matchDumpTask, payload: { matchId } }
        ]);
        
        if (result.runs[0].ok) {
          allResults.push(...result.runs[0].output);
        }
      }
    }
    
    return allResults;
  },
}); 