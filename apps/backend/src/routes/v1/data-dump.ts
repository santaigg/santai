import { Elysia, t } from 'elysia';
import { TriggerDevClient } from '../../trigger/client';
import PulseFinder from '@repo/pulsefinder-sdk';
import { DatabaseService } from '@repo/database';

// Initialize the Trigger.dev client
const triggerClient = new TriggerDevClient();
// Initialize the PulseFinder SDK
const pulsefinder = new PulseFinder({
  apiKey: process.env.PULSEFINDER_API_KEY,
  baseUrl: process.env.PULSEFINDER_API_URL
});

const db = new DatabaseService(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);

// Data dump API routes
export const dataDumpRouter = new Elysia({ prefix: '/data-dump' })
  // // Get task status
  // .get('/task/:taskId', 
  //   async ({ params }) => {
  //     const { taskId } = params;
  //     return await triggerClient.getTaskStatus(taskId);
  //   },
  //   {
  //     params: t.Object({
  //       taskId: t.String()
  //     })
  //   }
  // )
  
  // // Get task result
  // .get('/task/:taskId/result', 
  //   async ({ params }) => {
  //     const { taskId } = params;
  //     return await triggerClient.getTaskResult(taskId);
  //   },
  //   {
  //     params: t.Object({
  //       taskId: t.String()
  //     })
  //   }
  // )
  
  // // Dump player data
  // .post('/player', 
  //   async ({ body }) => {
  //     const { playerId } = body;
  //     const taskId = await triggerClient.dumpPlayer({ playerId });
  //     return { success: true, taskId };
  //   },
  //   {
  //     body: t.Object({
  //       playerId: t.String()
  //     })
  //   }
  // )
  
  // // Dump crew data
  // .post('/crew', 
  //   async ({ body }) => {
  //     const { crewId } = body;
  //     const taskId = await triggerClient.dumpCrew({ crewId });
  //     return { success: true, taskId };
  //   },
  //   {
  //     body: t.Object({
  //       crewId: t.String()
  //     })
  //   }
  // )
  
  // // Dump division data
  // .post('/division', 
  //   async ({ body }) => {
  //     const { divisionId } = body;
  //     const taskId = await triggerClient.dumpDivision({ divisionId });
  //     return { success: true, taskId };
  //   },
  //   {
  //     body: t.Object({
  //       divisionId: t.String()
  //     })
  //   }
  // )
  
  // // Dump team data
  // .post('/team', 
  //   async ({ body }) => {
  //     const { teamId, playerIds } = body;
  //     const taskId = await triggerClient.dumpTeam({ teamId, playerIds });
  //     return { success: true, taskId };
  //   },
  //   {
  //     body: t.Object({
  //       teamId: t.String(),
  //       playerIds: t.Optional(t.Array(t.String()))
  //     })
  //   }
  // )
  
  // // Dump match data
  // .post('/match', 
  //   async ({ body }) => {
  //     const { matchId } = body;
  //     const taskId = await triggerClient.dumpMatch({ matchId });
  //     return { success: true, taskId };
  //   },
  //   {
  //     body: t.Object({
  //       matchId: t.String()
  //     })
  //   }
  // )
  
  // // Bulk data dump
  // .post('/bulk', 
  //   async ({ body }) => {
  //     const { playerIds, crewIds, divisionIds, teamIds, matchIds } = body;
  //     const taskId = await triggerClient.dumpBulk({
  //       playerIds,
  //       crewIds,
  //       divisionIds,
  //       teamIds,
  //       matchIds
  //     });
  //     return { success: true, taskId };
  //   },
  //   {
  //     body: t.Object({
  //       playerIds: t.Optional(t.Array(t.String())),
  //       crewIds: t.Optional(t.Array(t.String())),
  //       divisionIds: t.Optional(t.Array(t.String())),
  //       teamIds: t.Optional(t.Array(t.String())),
  //       matchIds: t.Optional(t.Array(t.String()))
  //     })
  //   }
  .post('/matches', async ({ body }) => {
    let { matchIds, teamIds, playerIds } = body;
    
    // Filter out empty strings from the arrays
    matchIds = matchIds?.filter(id => id) || [];
    teamIds = teamIds?.filter(id => id) || [];
    playerIds = playerIds?.filter(id => id) || [];
    
    if (matchIds.length === 0 && teamIds.length === 0 && playerIds.length === 0) {
      return { error: 'At least one valid matchId, teamId, or playerId is required' };
    }
    
    let totalMatchesDumped = 0;
    const errors = [];
    const dumpedMatchIds = [];
    
    // Process matchIds
    if (matchIds.length > 0) {
      for (const matchId of matchIds) {
        try {
          const match = await pulsefinder.match.getMatch(matchId);
          if (!match.data) {
            errors.push(`No data found for match ID: ${matchId}`);
            continue;
          }
          const matchResponse = match.data;
          console.log('id', matchResponse.id, 'matchResponse', JSON.stringify(matchResponse.matchData));
          await db.insertRawMatch(matchResponse.id, matchResponse.matchData, matchResponse.date);
          totalMatchesDumped++;
          dumpedMatchIds.push(matchResponse.id);
        } catch (error: any) {
          console.error(`Error processing match ${matchId}:`, error);
          errors.push(`Failed to process match ${matchId}: ${error.message}`);
        }
      }
    }
    
    // Process teamIds
    if (teamIds.length > 0) {
      for (const teamId of teamIds) {
        try {
          const team = await pulsefinder.match.getTeamMatchHistory(teamId);
          if (!team.data) {
            errors.push(`No data found for team ID: ${teamId}`);
            continue;
          }
          const matchResponses = team.data;
          
          for (const matchResponse of matchResponses) {
            if (!matchResponse || !matchResponse.id) {
              errors.push(`Invalid match response from team ${teamId}`);
              continue;
            }
            
            if(matchResponse.matchData) {
              try {
                await db.insertRawMatch(matchResponse.id, matchResponse.matchData, matchResponse.date);
                totalMatchesDumped++;
                dumpedMatchIds.push(matchResponse.id);
              } catch (error: any) {
                console.error(`Error inserting match ${matchResponse.id}:`, error);
                errors.push(`Failed to insert match ${matchResponse.id}: ${error.message}`);
              }
            } else {
              console.error(`No match data found for match ${matchResponse.id}`);
              errors.push(`No match data found for match ${matchResponse.id}`);
            }
          }
        } catch (error: any) {
          console.error(`Error processing team ${teamId}:`, error);
          errors.push(`Failed to process team ${teamId}: ${error.message}`);
        }
      }
    }
    
    // Process playerIds
    if (playerIds.length > 0) {
      try {
        const player = await pulsefinder.team.getTeamsForPlayers(playerIds);
        if (!player.data) {
          errors.push(`No player data found for player IDs: ${playerIds.join(', ')}`);
        } else {
          const teams = player.data;
          for (const team of teams) {
            if(team.teamId) {
              try {
                const teamData = await pulsefinder.match.getTeamMatchHistory(team.teamId);
                if (!teamData.data) {
                  errors.push(`No team data found for team ID: ${team.teamId}`);
                  continue;
                }
                const matchResponses = teamData.data;
                for (const matchResponse of matchResponses) {
                  if (!matchResponse || !matchResponse.id) {
                    errors.push(`Invalid match response from team ${team.teamId}`);
                    continue;
                  }
                  
                  try {
                    await db.insertRawMatch(matchResponse.id, matchResponse.matchData, matchResponse.date);
                    totalMatchesDumped++;
                    dumpedMatchIds.push(matchResponse.id);
                  } catch (error: any) {
                    console.error(`Error inserting match ${matchResponse.id}:`, error);
                    errors.push(`Failed to insert match ${matchResponse.id}: ${error.message}`);
                  }
                }
              } catch (error: any) {
                console.error(`Error processing team ${team.teamId}:`, error);
                errors.push(`Failed to process team ${team.teamId}: ${error.message}`);
              }
            }
          }
        }
      } catch (error: any) {
        console.error('Error processing players:', error);
        const playerIdsStr = playerIds.join(', ');
        errors.push(`Failed to process players [${playerIdsStr}]: ${error.message}`);
      }
    }
    
    // Filter out duplicate match IDs
    const uniqueDumpedMatchIds = Array.from(new Set(dumpedMatchIds));
    
    return { 
      success: true, 
      totalMatchesDumped,
      dumpedMatchIds: uniqueDumpedMatchIds,
      errors: errors.length > 0 ? errors : undefined
    };
  },
  {
    body: t.Object({
      matchIds: t.Optional(t.Array(t.String())),
      teamIds: t.Optional(t.Array(t.String())),
      playerIds: t.Optional(t.Array(t.String()))
    })
  }
)
