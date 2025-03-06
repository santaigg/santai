import { Elysia } from 'elysia';
import { playerControllerV2 } from '../../../modules/player';

// V2 Players Router
export const playersRouter = new Elysia({ prefix: '/players' })
  // Mount the v2 player controller
  .use(playerControllerV2); 