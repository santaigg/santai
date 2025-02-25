import { Elysia } from 'elysia';

// V1 API Router - combines all v1 resource routers
export const v1Router = new Elysia({ prefix: '/v1' })
  // Version info endpoint
  .get('/', () => ({
    version: 'v1',
    resources: [],
    deprecated: false,
    sunset: null // Date when this version will be deprecated
  }));