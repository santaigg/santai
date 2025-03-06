import { Elysia } from 'elysia';
import { matchController } from '../../../modules/match';

// V1 Match Router
export const matchesRouter = new Elysia({ prefix: '/match' })
  // Mount the match controller
  .use(matchController); 