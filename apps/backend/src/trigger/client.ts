import { tasks, runs } from "@trigger.dev/sdk/v3";
import type {
  PlayerDumpTaskInput,
  CrewDumpTaskInput,
  DivisionDumpTaskInput,
  TeamDumpTaskInput,
  MatchDumpTaskInput,
  BulkDumpTaskInput,
  DumpResult
} from './interfaces';
import {
  playerDumpTask,
  crewDumpTask,
  divisionDumpTask,
  teamDumpTask,
  matchDumpTask,
  bulkDumpTask
} from './tasks';

/**
 * Trigger.dev client service for executing tasks
 */
export class TriggerDevClient {
  /**
   * Execute a player dump task
   */
  async dumpPlayer(input: PlayerDumpTaskInput): Promise<string> {
    try {
      const { id } = await tasks.trigger(playerDumpTask.id, input);
      return id;
    } catch (error) {
      console.error('Failed to execute player dump task:', error);
      throw error;
    }
  }

  /**
   * Execute a crew dump task
   */
  async dumpCrew(input: CrewDumpTaskInput): Promise<string> {
    try {
      const { id } = await tasks.trigger(crewDumpTask.id, input);
      return id;
    } catch (error) {
      console.error('Failed to execute crew dump task:', error);
      throw error;
    }
  }

  /**
   * Execute a division dump task
   */
  async dumpDivision(input: DivisionDumpTaskInput): Promise<string> {
    try {
      const { id } = await tasks.trigger(divisionDumpTask.id, input);
      return id;
    } catch (error) {
      console.error('Failed to execute division dump task:', error);
      throw error;
    }
  }

  /**
   * Execute a team dump task
   */
  async dumpTeam(input: TeamDumpTaskInput): Promise<string> {
    try {
      const { id } = await tasks.trigger(teamDumpTask.id, input);
      return id;
    } catch (error) {
      console.error('Failed to execute team dump task:', error);
      throw error;
    }
  }

  /**
   * Execute a match dump task
   */
  async dumpMatch(input: MatchDumpTaskInput): Promise<string> {
    try {
      const { id } = await tasks.trigger(matchDumpTask.id, input);
      return id;
    } catch (error) {
      console.error('Failed to execute match dump task:', error);
      throw error;
    }
  }

  /**
   * Execute a bulk dump task
   */
  async dumpBulk(input: BulkDumpTaskInput): Promise<string> {
    try {
      const { id } = await tasks.trigger(bulkDumpTask.id, input);
      return id;
    } catch (error) {
      console.error('Failed to execute bulk dump task:', error);
      throw error;
    }
  }

  /**
   * Get task status
   */
  async getTaskStatus(taskId: string): Promise<any> {
    try {
      const status = await runs.retrieve(taskId);
      return status;
    } catch (error) {
      console.error('Failed to get task status:', error);
      throw error;
    }
  }

  /**
   * Get task result
   */
  async getTaskResult(taskId: string): Promise<DumpResult[]> {
    try {
      const run = await runs.retrieve(taskId);
      
      if (run.isSuccess) {
        return run.output as DumpResult[];
      } else if (run.isFailed) {
        throw new Error(`Task failed: ${run.attempts[0]?.error?.message || 'Unknown error'}`);
      } else {
        throw new Error(`Task is still running or in an unexpected state: ${run.status}`);
      }
    } catch (error) {
      console.error('Failed to get task result:', error);
      throw error;
    }
  }
} 