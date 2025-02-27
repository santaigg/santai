# PulseFinder SDK

A TypeScript library for interacting with the PulseFinder API. This package is primarily for internal use within the monorepo.

## Bun Compatibility

This SDK is fully compatible with Bun and optimized for use in Bun projects. It includes:

- Bun-specific test files using `bun:test`
- Proper path resolution using `import.meta.dir`
- Bun configuration via `bunfig.toml`
- ESM module format

## Usage within the monorepo

### Install dependencies

```bash
# From the root of the monorepo
bun install
```

### Build the SDK

```bash
# From the root of the monorepo
bun run build --filter=@repo/pulsefinder-sdk
```

### Using the SDK in another package

```typescript
// In another package within the monorepo
import { PulseFinder, Platform } from '@repo/pulsefinder-sdk';

// Initialize the SDK (no API key needed for local development)
const pulsefinder = new PulseFinder();

// With API key (required for production)
const pulsefinder = new PulseFinder({
  apiKey: process.env.PULSEFINDER_API_KEY,
});
```

## API Reference

### Player API

```typescript
// Get a player profile by ID
const player = await pulsefinder.player.getPlayerProfile('player-id');

// Get multiple player profiles
const players = await pulsefinder.player.getBulkProfiles(['player-id-1', 'player-id-2']);

// Search for a player by platform account ID
import { Platform } from '@repo/pulsefinder-sdk';
const player = await pulsefinder.player.searchByPlatform(Platform.DISCORD, 'discord-id');
```

### Match API

```typescript
// Get match details
const match = await pulsefinder.match.getMatchDetails('match-id');

// Get match history for a player
const matches = await pulsefinder.match.getPlayerMatchHistory('player-id');

// Get match history for a player with pagination
const matches = await pulsefinder.match.getPlayerMatchHistory('player-id', 10, 20);

// Get match history for a team
const matches = await pulsefinder.match.getTeamMatchHistory('team-id');
```

### Error Handling

The SDK provides custom error classes for different types of errors:

```typescript
import { PulseFinderError, AuthenticationError, NotFoundError } from '@repo/pulsefinder-sdk';

try {
  const player = await pulsefinder.player.getPlayerProfile('player-id');
} catch (error) {
  if (error instanceof AuthenticationError) {
    console.error('Authentication failed:', error.message);
  } else if (error instanceof NotFoundError) {
    console.error('Player not found:', error.message);
  } else if (error instanceof PulseFinderError) {
    console.error('PulseFinder API error:', error.message, error.statusCode);
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## Development

### Running tests

```bash
# From the root of the monorepo
bun test --filter=@repo/pulsefinder-sdk

# Or from the package directory
bun test
```

### Using the example

The SDK includes a Bun example file that demonstrates basic usage:

```bash
# Run the example
bun run examples/bun-example.ts
```

### Testing against a local PulseFinder API

By default, the SDK will connect to `http://localhost:3000` in development mode. Make sure your local PulseFinder API is running.

```bash
# Test the SDK against a local API
bun run test:sdk
```

## Environment Variables

For local development, no environment variables are required. For production use:

```
# Required for production
PULSEFINDER_API_KEY=your_api_key_here

# Optional: Custom API URL (defaults to http://localhost:3000 in development)
PULSEFINDER_API_URL=https://api.pulsefinder.example.com
``` 