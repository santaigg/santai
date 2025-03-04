/**
 * Trigger.dev workflow and task interfaces
 */

// Task input/output interfaces
export interface PlayerDumpTaskInput {
  playerId: string;
}

export interface CrewDumpTaskInput {
  crewId: string;
}

export interface DivisionDumpTaskInput {
  divisionId: string;
}

export interface TeamDumpTaskInput {
  teamId: string;
  playerIds?: string[];
}

export interface MatchDumpTaskInput {
  matchId: string;
}

export interface BulkDumpTaskInput {
  playerIds?: string[];
  crewIds?: string[];
  divisionIds?: string[];
  teamIds?: string[];
  matchIds?: string[];
}

export interface DumpResult {
  success: boolean;
  entityId: string;
  entityType: string;
  message?: string;
  error?: string;
  timestamp: string;
}

// Activity input/output interfaces
export interface DumpPlayerActivityInput {
  playerId: string;
}

export interface DumpCrewActivityInput {
  crewId: string;
}

export interface DumpDivisionActivityInput {
  divisionId: string;
}

export interface DumpTeamActivityInput {
  teamId: string;
  playerIds?: string[];
}

export interface DumpMatchActivityInput {
  matchId: string;
}

export interface DumpPlayerTeamsActivityInput {
  playerId: string;
}

export interface DumpTeamMatchesActivityInput {
  teamId: string;
}

export interface DumpPlayerMatchesActivityInput {
  playerId: string;
} 