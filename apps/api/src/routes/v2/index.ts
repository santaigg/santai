import { Elysia } from 'elysia';
// import { playersRouter } from './players';

// // V2 API Router - combines all v2 resource routers
// export const v2Router = new Elysia({ prefix: '/v2' })
//   // Version info endpoint
//   .get('/', () => ({
//     version: 'v2',
//     resources: ['players'],
//     deprecated: false,
//     sunset: null // Date when this version will be deprecated
//   }))
//   // Mount versioned routers
//   .use(playersRouter); 