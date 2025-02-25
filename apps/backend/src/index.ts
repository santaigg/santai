import { Elysia, t } from 'elysia';
import { swagger } from '@elysiajs/swagger';
import { cors } from '@elysiajs/cors';
import { rootRouter } from './routes';

// Create the main app
const app = new Elysia()
  // Add global middleware
  .use(cors())
  .use(swagger({
    documentation: {
      info: {
        title: 'Santai Backend',
        version: '1.0.0',
        description: 'A versioned REST API from Santai'
      },
      tags: [
        { name: 'General', description: 'General endpoints' }
      ]
    }
  }))
  
  // Add global error handling
  .onError(({ code, error, set }) => {
    console.error(`Error: ${code}`, error);
    
    if (code === 'NOT_FOUND') {
      set.status = 404;
      return {
        error: 'Not Found',
        message: 'The requested resource does not exist',
        status: 404
      };
    }
    
    if (code === 'VALIDATION') {
      set.status = 400;
      return {
        error: 'Bad Request',
        message: error.message,
        status: 400
      };
    }
    
    set.status = 500;
    return {
      error: 'Internal Server Error',
      message: 'An unexpected error occurred',
      status: 500
    };
  })
  
  // Add global response headers
  .onBeforeHandle(({ set }) => {
    set.headers['X-API'] = 'Wavescan';
  })
  
  // Mount the root router
  .use(rootRouter)
  
  // Start the server
  .listen(3000);

console.log(`🦊 Wavescan (ElysiaJS) server is running at ${app.server?.hostname}:${app.server?.port}`);
console.log(`📚 Wavescan (ElysiaJS) Swagger documentation available at http://${app.server?.hostname}:${app.server?.port}/swagger`);

export type App = typeof app;
