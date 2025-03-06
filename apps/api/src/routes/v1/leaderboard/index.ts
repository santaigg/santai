import { Elysia } from 'elysia';
import { leaderboardController } from '../../../modules/leaderboard';

// V1 Leaderboard Router
export const leaderboardRouter = new Elysia({ prefix: '/leaderboard' })
  // Mount the leaderboard controller
  .use(leaderboardController); 