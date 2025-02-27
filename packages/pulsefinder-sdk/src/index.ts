import { Auth } from './auth';
import { PlayerService, MatchService } from './services';
import { AuthConfig } from './types';

/**
 * PulseFinder SDK - A TypeScript library for interacting with the PulseFinder API
 * For internal use within the monorepo
 */
export class PulseFinder {
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
   * Create a new PulseFinder SDK instance
   * @param config Authentication configuration (optional in development)
   */
  constructor(config: AuthConfig = {}) {
    this.auth = new Auth(config);
    const client = this.auth.getClient();
    
    // Initialize services
    this.player = new PlayerService(client);
    this.match = new MatchService(client);
  }

  /**
   * Check if the current authentication is valid
   * @returns Promise that resolves to true if authentication is valid
   */
  async validateAuth(): Promise<boolean> {
    return this.auth.validateAuth();
  }
}

// Export types
export * from './types';
export * from './services'; 