import { Elysia } from 'elysia';
import { tournamentController } from '../../../modules/tournament';

// V1 Tournament Router
export const tournamentRouter = new Elysia({ prefix: '/tournament' })
  // Mount the tournament controller
  .use(tournamentController); 