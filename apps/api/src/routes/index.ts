import { Elysia } from 'elysia';
import { v1Router } from './v1/index';
// import { v2Router } from './v2/index';

// Main API router that combines all version routers
export const rootRouter = new Elysia({ prefix: '/api' })
  // Add version information to the root endpoint
  .get('/', () => ({ 
    message: 'API Documentation',
    versions: ['v1', 'v2'],
    current: 'v2',
    docs: '/api/docs'
  }))
  // Health check endpoint (unversioned)
  .get('/health', () => ({ 
    status: 'healthy',
    timestamp: new Date().toISOString()
  }))
  // Mount versioned routers
  .use(v1Router)
  // .use(v2Router);
