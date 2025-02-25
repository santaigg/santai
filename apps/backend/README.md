# Versioned API with ElysiaJS

This is a versioned REST API built with [ElysiaJS](https://elysiajs.com/) in a monorepo structure.

## API Versioning Strategy

This API uses URI path versioning, which includes the version in the URL path:

```
/api/v1/resource
```

### Benefits of this approach:

- Clear and explicit versioning
- Easy to understand for API consumers
- Simple to route to different code bases
- Allows for multiple versions to coexist

## API Structure

```
/api                  # API root - provides version information
/api/health           # Health check endpoint (unversioned)
/api/v1               # Version 1 root - provides resource information
/api/v1/resource      # Version 1 resources
```

## Adding New Versions

To add a new API version:

1. Create a new directory in `src/routes` (e.g., `v2`)
2. Create an index.ts file for the new version
3. Implement the new version's endpoints
4. Import and mount the new version router in `src/routes/index.ts`

Example for adding v2:

```typescript
// src/routes/v2/index.ts
import { Elysia } from 'elysia';

export const v2Router = new Elysia({ prefix: '/v2' })
  .get('/', () => ({
    version: 'v2',
    resources: [],
    deprecated: false
  }));

// src/routes/index.ts
import { v2Router } from './v2';

// Add to rootRouter
export const rootRouter = new Elysia({ prefix: '/api' })
  // ... existing code
  .use(v1Router)
  .use(v2Router);
```

## Deprecating Versions

When deprecating a version:

1. Update the version info to indicate deprecation
2. Set a sunset date
3. Add deprecation headers

Example:

```typescript
export const v1Router = new Elysia({ prefix: '/v1' })
  .onBeforeHandle(({ set }) => {
    set.headers['Deprecation'] = 'true';
    set.headers['Sunset'] = 'Sat, 31 Dec 2023 23:59:59 GMT';
  })
  .get('/', () => ({
    version: 'v1',
    resources: [],
    deprecated: true,
    sunset: '2023-12-31T23:59:59Z'
  }));
```

## Getting Started

First, run the development server:

```bash
cd ../../
bun dev
```

Or to run just this app:

```bash
cd apps/api
bun dev
```

Open [http://localhost:3000/api](http://localhost:3000/api) with your browser to see the API documentation.

API Swagger documentation is available at [http://localhost:3000/swagger](http://localhost:3000/swagger).

## Testing

Run tests with:

```bash
bun test
```
