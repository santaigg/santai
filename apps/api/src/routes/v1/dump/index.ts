import { Elysia } from 'elysia';
import { dumpController } from '../../../modules/dump';

// V1 Dump Router
export const dumpRouter = new Elysia({ prefix: '/dump' })
  // Mount the dump controller
  .use(dumpController); 