import { Auth } from './auth';
import { 
  MatchService, 
  PlayerService, 
  StatsService, 
  TeamService,
  CrewService,
  DivisionService
} from './services';
import { AuthConfig } from './types';

/**
 * PulseFinder SDK - A TypeScript library for interacting with the PulseFinder API
 * For internal use within the monorepo
 */
class PulseFinder {
  private auth: Auth;
  
  /**
   * Player-related API methods
   */
  public player: PlayerService;
  
  /**
   * Match-related API methods
   */
  public match: MatchService;

  /**
   * Stats-related API methods
   */
  public stats: StatsService;

  /**
   * Team-related API methods
   */
  public team: TeamService;

  /**
   * Crew-related API methods
   */
  public crew: CrewService;

  /**
   * Division-related API methods
   */
  public division: DivisionService;

  /**
   * Create a new PulseFinder SDK instance
   * @param config Authentication configuration (optional in development)
   */
  constructor(config: AuthConfig = {}) {
    this.auth = new Auth(config);
    const client = this.auth.getClient();
    
    // Initialize services
    this.player = new PlayerService(client);
    this.match = new MatchService(client);
    this.stats = new StatsService(client);
    this.team = new TeamService(client);
    this.crew = new CrewService(client);
    this.division = new DivisionService(client);
  }

  /**
   * Check if the current authentication is valid
   * @returns Promise that resolves to true if authentication is valid
   */
  async validateAuth(): Promise<boolean> {
    return this.auth.validateAuth();
  }
}

// Export types and utilities
export * from './types';
export * from './services';
export * from './utils';
export * from './auth';

// Export the PulseFinder class as default
export default PulseFinder; 