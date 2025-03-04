import { Elysia, t } from 'elysia';
import { TriggerDevClient } from '../../trigger/client';

// Initialize the Trigger.dev client
const triggerClient = new TriggerDevClient();

// Data dump API routes
export const dataDumpRouter = new Elysia({ prefix: '/data-dump' })
  // Get task status
  .get('/task/:taskId', 
    async ({ params }) => {
      const { taskId } = params;
      return await triggerClient.getTaskStatus(taskId);
    },
    {
      params: t.Object({
        taskId: t.String()
      })
    }
  )
  
  // Get task result
  .get('/task/:taskId/result', 
    async ({ params }) => {
      const { taskId } = params;
      return await triggerClient.getTaskResult(taskId);
    },
    {
      params: t.Object({
        taskId: t.String()
      })
    }
  )
  
  // Dump player data
  .post('/player', 
    async ({ body }) => {
      const { playerId } = body;
      const taskId = await triggerClient.dumpPlayer({ playerId });
      return { success: true, taskId };
    },
    {
      body: t.Object({
        playerId: t.String()
      })
    }
  )
  
  // Dump crew data
  .post('/crew', 
    async ({ body }) => {
      const { crewId } = body;
      const taskId = await triggerClient.dumpCrew({ crewId });
      return { success: true, taskId };
    },
    {
      body: t.Object({
        crewId: t.String()
      })
    }
  )
  
  // Dump division data
  .post('/division', 
    async ({ body }) => {
      const { divisionId } = body;
      const taskId = await triggerClient.dumpDivision({ divisionId });
      return { success: true, taskId };
    },
    {
      body: t.Object({
        divisionId: t.String()
      })
    }
  )
  
  // Dump team data
  .post('/team', 
    async ({ body }) => {
      const { teamId, playerIds } = body;
      const taskId = await triggerClient.dumpTeam({ teamId, playerIds });
      return { success: true, taskId };
    },
    {
      body: t.Object({
        teamId: t.String(),
        playerIds: t.Optional(t.Array(t.String()))
      })
    }
  )
  
  // Dump match data
  .post('/match', 
    async ({ body }) => {
      const { matchId } = body;
      const taskId = await triggerClient.dumpMatch({ matchId });
      return { success: true, taskId };
    },
    {
      body: t.Object({
        matchId: t.String()
      })
    }
  )
  
  // Bulk data dump
  .post('/bulk', 
    async ({ body }) => {
      const { playerIds, crewIds, divisionIds, teamIds, matchIds } = body;
      const taskId = await triggerClient.dumpBulk({
        playerIds,
        crewIds,
        divisionIds,
        teamIds,
        matchIds
      });
      return { success: true, taskId };
    },
    {
      body: t.Object({
        playerIds: t.Optional(t.Array(t.String())),
        crewIds: t.Optional(t.Array(t.String())),
        divisionIds: t.Optional(t.Array(t.String())),
        teamIds: t.Optional(t.Array(t.String())),
        matchIds: t.Optional(t.Array(t.String()))
      })
    }
  ); 