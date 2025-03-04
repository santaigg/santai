# Trigger.dev in Santai Backend

## What is Trigger.dev?

Trigger.dev is a developer-first, open-source platform for creating and managing background jobs and workflows. It provides a simple, reliable way to run code on a schedule or in response to events.

## How Trigger.dev is Used in Santai

In the Santai backend, Trigger.dev is used to orchestrate data dumping operations from the PulseFinder API. This includes fetching and storing data for players, crews, teams, divisions, matches, and their relationships.

## Architecture Overview

The Trigger.dev implementation in Santai follows a standard pattern:

1. **Client**: Initiates tasks from API endpoints
2. **Tasks**: Define the orchestration logic
3. **Activities**: Perform the actual work
4. **Event Triggers**: Connect events to tasks

```
┌─────────┐     ┌─────────────┐     ┌─────────────┐     ┌───────────────┐
│  API    │────▶│  Trigger.dev│────▶│  Trigger.dev│────▶│  PulseFinder  │
│ Routes  │     │   Client    │     │   Tasks     │     │      API      │
└─────────┘     └─────────────┘     └─────────────┘     └───────────────┘
                                          │
                                          ▼
                                    ┌─────────────┐
                                    │  Database   │
                                    │  Storage    │
                                    └─────────────┘
```

## Key Components

### 1. Interfaces (`interfaces.ts`)

Defines TypeScript interfaces for task and activity inputs/outputs, ensuring type safety throughout the system.

```typescript
// Example interface
export interface DumpResult {
  success: boolean;
  entityId: string;
  entityType: string;
  message?: string;
  error?: string;
  timestamp: string;
}
```

### 2. Client (`client.ts`)

Provides methods to start tasks from API endpoints. It handles the connection to the Trigger.dev server and task execution.

```typescript
// Example client method
async dumpPlayer(input: PlayerDumpTaskInput): Promise<string> {
  const { id } = await this.client.sendEvent({
    name: "player.dump",
    payload: input,
  });
  
  return id;
}
```

### 3. Tasks (`tasks.ts`)

Define the orchestration logic for data dumping operations. Tasks coordinate the execution of activities in a specific order.

```typescript
// Example task
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
```

### 4. Activities (`activities.ts`)

Implement the actual work to be performed. Activities interact with external systems like the PulseFinder API and databases.

```typescript
// Example activity
export async function dumpPlayerActivity(input: DumpPlayerActivityInput): Promise<DumpResult> {
  try {
    const { playerId } = input;
    logger.log(`Dumping player data for player ID: ${playerId}`);
    
    // Fetch player profile using the SDK
    const playerProfile = await pulseFinder.player.getPlayerProfile(playerId);
    
    // In a real implementation, you might store this data in a database
    logger.log(`Successfully dumped player data for ${playerProfile.displayName}`);
    
    return {
      success: true,
      entityId: playerId,
      entityType: 'player',
      message: `Successfully dumped player data for ${playerProfile.displayName}`,
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
```

### 5. Event Triggers (`events.ts`)

Connect events to tasks, allowing tasks to be triggered by events.

```typescript
// Example event trigger
export const playerDumpEventTrigger = eventTrigger({
  name: "player.dump",
  task: playerDumpTask,
});
```

## Task Types

The following tasks are implemented:

1. **playerDumpTask**: Dumps player data, including teams and matches
2. **crewDumpTask**: Dumps crew data
3. **divisionDumpTask**: Dumps division data
4. **teamDumpTask**: Dumps team data, including matches
5. **matchDumpTask**: Dumps match data
6. **bulkDumpTask**: Orchestrates multiple dump operations in a single task

## Activity Types

The following activities are implemented:

1. **dumpPlayerActivity**: Dumps player profile data
2. **dumpCrewActivity**: Dumps crew data
3. **dumpDivisionActivity**: Dumps division data
4. **dumpTeamActivity**: Dumps team data
5. **dumpMatchActivity**: Dumps match data
6. **dumpPlayerTeamsActivity**: Dumps teams associated with a player
7. **dumpTeamMatchesActivity**: Dumps matches associated with a team
8. **dumpPlayerMatchesActivity**: Dumps matches associated with a player

## Benefits of Using Trigger.dev

1. **Reliability**: Tasks continue execution even if the worker process crashes
2. **Visibility**: Provides a dashboard to monitor task execution and debug issues
3. **Retries**: Automatically retries failed tasks with configurable policies
4. **Scalability**: Easily scale workers horizontally to handle increased load
5. **Developer Experience**: Simple, intuitive API for defining and running tasks

## Running Trigger.dev

To run the Trigger.dev development server:

```bash
bun run trigger:dev
```

To deploy to production:

```bash
bun run trigger:deploy
```

## Environment Variables

The following environment variables are used:

- `TRIGGER_API_KEY`: API key for Trigger.dev
- `TRIGGER_API_URL`: URL for Trigger.dev API (default: 'https://api.trigger.dev')
- `TRIGGER_PUBLIC_API_KEY`: Public API key for Trigger.dev
- `PULSEFINDER_API_KEY`: API key for PulseFinder SDK
- `PULSEFINDER_API_URL`: Base URL for PulseFinder API

## Debugging Tasks

You can use the Trigger.dev dashboard to monitor and debug tasks. By default, it's available at https://cloud.trigger.dev or your self-hosted instance.

## Best Practices

1. **Keep activities idempotent**: Activities should be designed to be safely retried
2. **Use appropriate timeouts**: Set appropriate timeouts for activities and tasks
3. **Handle errors gracefully**: Implement proper error handling in activities
4. **Monitor task execution**: Use the Trigger.dev dashboard to monitor task execution
5. **Use event triggers for long-running tasks**: Use event triggers to initiate long-running tasks 