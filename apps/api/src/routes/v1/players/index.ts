import { Elysia } from 'elysia';
import { playerControllerV1 } from '../../../modules/player';

// V1 API Router - player routes
export const playersRouter = new Elysia({ prefix: '/player' })
  // Mount the player controller
  .use(playerControllerV1);
