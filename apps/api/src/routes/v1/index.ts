import { Elysia } from 'elysia';
import { playersRouter } from './players';
import { matchesRouter } from './matches';
import { tournamentRouter } from './tournament';
import { leaderboardRouter } from './leaderboard';
import { sponsorRouter } from './sponsor';
import { searchRouter } from './search';
import { dumpRouter } from './dump';

// V1 API Router - combines all v1 resource routers
export const v1Router = new Elysia({ prefix: '/v1' })
  // Version info endpoint
  .get('/', () => ({
    version: 'v1',
    resources: ['players', 'matches', 'tournament', 'leaderboard', 'sponsor', 'search', 'dump'],
    deprecated: false,
    sunset: null // Date when this version will be deprecated
  }))
  // Mount versioned routers
  .use(playersRouter)
  .use(matchesRouter)
  .use(tournamentRouter)
  .use(leaderboardRouter)
  .use(sponsorRouter)
  .use(searchRouter)
  .use(dumpRouter);