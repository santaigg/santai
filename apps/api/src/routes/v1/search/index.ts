import { Elysia } from 'elysia';
import { searchController } from '../../../modules/search';

// V1 Search Router
export const searchRouter = new Elysia({ prefix: '/search' })
  // Mount the search controller
  .use(searchController); 