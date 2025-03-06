import { Elysia } from 'elysia';
import { sponsorController } from '../../../modules/sponsor';

// V1 Sponsor Router
export const sponsorRouter = new Elysia({ prefix: '/sponsor' })
  // Mount the sponsor controller
  .use(sponsorController); 