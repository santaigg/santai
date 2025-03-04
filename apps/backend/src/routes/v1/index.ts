import { Elysia } from 'elysia';
import { dataDumpRouter } from './data-dump';

// V1 API Router - combines all v1 resource routers
export const v1Router = new Elysia({ prefix: '/v1' })
  // Version info endpoint
  .get('/', () => ({
    version: 'v1',
    resources: ['data-dump'],
    deprecated: false,
    sunset: null // Date when this version will be deprecated
  }))
  // Mount resource routers
  .use(dataDumpRouter);