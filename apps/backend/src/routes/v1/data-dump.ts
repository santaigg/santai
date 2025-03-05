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
    const { matchId, teamId, playerIds } = body;
    if (!matchId && !teamId && !playerIds) {
      return { error: 'Match ID, team ID, or player ID is required' };
    }
    if (matchId) {
      const match = await pulsefinder.match.getMatch(matchId);
      if (!match.data) {
        return { error: 'No match data found' };
      }
      const matchResponse = match.data;
      console.log('id', matchResponse.id, 'matchResponse', JSON.stringify(matchResponse.matchData));
      try {
        await db.insertRawMatch(matchResponse.id, matchResponse.matchData, matchResponse.date);
        return { success: true, match };
      } catch (error: any) {
        console.error('Error inserting match:', error);
        
        // Extract more detailed error information
        const errorDetails = {
          name: error.name,
          message: error.message,
          cause: error.cause ? {
            name: error.cause.name,
            message: error.cause.message,
            code: error.cause.code,
            details: error.cause.details,
            hint: error.cause.hint
          } : 'No cause'
        };
        
        console.error('Detailed error:', JSON.stringify(errorDetails, null, 2));
        
        return { 
          success: false, 
          error: `Failed to insert match: ${error.message}`,
          details: JSON.stringify(errorDetails)
        };
      }
    }
    if (teamId) {
      const team = await pulsefinder.match.getTeamMatchHistory(teamId);
      if (!team.data) {
        return { error: 'No team data found' };
      }
      const matchResponses = team.data;
      // for each match in teamData, insert the match data
      for (const matchResponse of matchResponses) {
        if(matchResponse.matchData) {
          try {
            await db.insertRawMatch(matchResponse.id, matchResponse.matchData, matchResponse.date);
          } catch (error: any) {
            console.error(`Error inserting match ${matchResponse.id}:`, error);
            console.error('Details:', error.cause ? JSON.stringify(error.cause) : 'No additional details');
          }
        } else {
          console.error(`No match data found for match ${matchResponse.id}`);
        }
      }
      return { success: true, team };
    }
    if (playerIds) {
      const player = await pulsefinder.team.getTeamsForPlayers(playerIds);
      if (!player.data) {
        return { error: 'No player data found' };
      }
      const teams = player.data;
      for (const team of teams) {
        if(team.teamId) {
          const teamData = await pulsefinder.match.getTeamMatchHistory(team.teamId);
          if (!teamData.data) {
            return { error: 'No team data found' };
          }
          const matchResponses = teamData.data;
          for (const matchResponse of matchResponses) {
            try {
              await db.insertRawMatch(matchResponse.id, matchResponse.matchData, matchResponse.date);
            } catch (error: any) {
              console.error(`Error inserting match ${matchResponse.id}:`, error);
              console.error('Details:', error.cause ? JSON.stringify(error.cause) : 'No additional details');
            }
          }
        }
      }
    }
  },
  {
    body: t.Object({
      matchId: t.Optional(t.String()),
      teamId: t.Optional(t.String()),
      playerIds: t.Optional(t.Array(t.String()))
    })
  }
)
