import { Elysia, t } from 'elysia';
import { swagger } from '@elysiajs/swagger';
import { cors } from '@elysiajs/cors';
import { bearer } from '@elysiajs/bearer';
import * as Sentry from '@sentry/bun';
import { rootRouter } from './routes';
import { Database } from './services/database';
import { Redis } from './services/redis';
import { Steam } from './services/steam';

// Initialize services
const db = Database.getInstance();
const redis = Redis.getInstance();
const steam = Steam.getInstance();

// Initialize Sentry if DSN is provided
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0, // Capture 100% of the transactions
  });
  console.log('🔍 Sentry initialized');
}

// Default timeout is 10 seconds, but we'll use 60 seconds for the server
const SERVER_TIMEOUT = 60000; // 60 seconds

// Create the main app
const app = new Elysia()
  // Add global middleware
  .use(cors())
  .use(bearer())
  .use(swagger({
    documentation: {
      info: {
        title: 'Santai API',
        version: '1.0.0',
        description: 'A versioned REST API from Santai'
      },
      tags: [
        { name: 'General', description: 'General endpoints' },
        { name: 'Players', description: 'Player endpoints (v1)' },
        { name: 'Players V2', description: 'Enhanced player endpoints (v2)' },
        { name: 'Matches', description: 'Match endpoints' }
      ]
    }
  }))
  
  // Add global error handling
  .onError(({ code, error, set }) => {
    console.error(`Error: ${code}`, error);
    
    // Log error to Sentry if available
    if (process.env.SENTRY_DSN) {
      Sentry.captureException(error);
    }
    
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
    set.headers['X-API'] = 'Santai';
  })
  
  // Mount the root router
  .use(rootRouter)
  
  // Start the server
  .listen(3000);

console.log(`🦊 Santai API server is running at ${app.server?.hostname}:${app.server?.port}`);
console.log(`📚 Santai API Swagger documentation available at http://${app.server?.hostname}:${app.server?.port}/swagger`);

export type App = typeof app;
