import { tasks } from "@trigger.dev/sdk/v3";
import {
  playerDumpTask,
  crewDumpTask,
  divisionDumpTask,
  teamDumpTask,
  matchDumpTask,
  bulkDumpTask
} from './tasks';

// Export the tasks for use in the client
export const triggerTasks = {
  playerDump: (payload: { playerId: string }) => 
    tasks.trigger(playerDumpTask.id, payload),
  
  crewDump: (payload: { crewId: string }) => 
    tasks.trigger(crewDumpTask.id, payload),
  
  divisionDump: (payload: { divisionId: string }) => 
    tasks.trigger(divisionDumpTask.id, payload),
  
  teamDump: (payload: { teamId: string, playerIds?: string[] }) => 
    tasks.trigger(teamDumpTask.id, payload),
  
  matchDump: (payload: { matchId: string }) => 
    tasks.trigger(matchDumpTask.id, payload),
  
  bulkDump: (payload: { 
    playerIds?: string[],
    crewIds?: string[],
    divisionIds?: string[],
    teamIds?: string[],
    matchIds?: string[]
  }) => tasks.trigger(bulkDumpTask.id, payload)
}; 