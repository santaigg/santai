# Pulsefinder Submodule

This document explains how to work with the pulsefinder submodule in the Santai project.

# Pulsefinder Service

Pulsefinder is our private API service that acts as an intermediary between our applications and Spectre Divide's backend services. It maintains persistent connections to game servers and exposes a REST API for other services to interact with.

## Overview

Pulsefinder is a private repository that has been added as a git submodule in the `apps/pulsefinder` directory. It contains sensitive game service functionality and is kept private while the main Santai repository is public.

Pulsefinder handles two types of game interactions through a single REST API:

1. **Game Operations** - Handled via internal Game-Account pool:
- Friend requests
- Party invites
- Game invites
- Lobby configuration
- Real-time game state updates

2. **Historical Data** - Direct HTTP requests to game servers:
- Match statistics
- Player profiles
- Historical performance data

## Architecture

```
                                Internal Network
┌──────────────┐     HTTP     ┌──────────────┐     Account     ┌──────────────┐
│  Smokeshift  │ ──────────── │  Pulsefinder │ ═══════════════ │ Game Servers │
└──────────────┘              └──────────────┘      Pool       └──────────────┘
    │                             │                               │
    │                             │           HTTP                │
    │                             └───────────────────────────────┘
    │
┌──────────────┐
│  Other Apps  │
└──────────────┘
```

Pulsefinder is only accessible by our internal backend service (Smokeshift). All other applications must route their requests through Smokeshift.

## API Integration

Example of integrating with Pulsefinder from Smokeshift:

```typescript
// Get match statistics
const response = await fetch('http://pulsefinder.internal/api/matches/${matchId}', {
headers: {
    'Authorization': 'Bearer ${PULSEFINDER_API_KEY}'
}
});

// Send party invite (Pulsefinder handles the Game-Account communication)
await fetch('http://pulsefinder.internal/api/party/invite', {
method: 'POST',
headers: {
    'Authorization': 'Bearer ${PULSEFINDER_API_KEY}',
    'Content-Type': 'application/json'
},
body: JSON.stringify({
    playerId: '123',
    partyId: '456'
})
});
```

## Initial Setup

When you first clone the Santai repository, if you have access to `pulsefinder` you need to initialize and update the submodule:

```bash
git submodule init
git submodule update
```

## Repository Access

Pulsefinder is included in this monorepo as a Git submodule at `apps/pulsefinder`. Due to its sensitive nature, access to the Pulsefinder repository is restricted.

### For Contributors with Access
If you have access to the Pulsefinder repository:
```bash
# Clone the monorepo with submodules
git clone --recursive https://github.com/santaigg/santai

# Or if already cloned, initialize the submodule
git submodule update --init --recursive
```

### For Users without Access
The `apps/pulsefinder` directory will appear empty. This is expected and won't affect your ability to work with other parts of the monorepo.

## Environment Configuration

Pulsefinder requires several environment variables to function properly. Create a `.env` file in the `apps/pulsefinder` directory based on the `.env.example` file:

```bash
cp apps/pulsefinder/.env.example apps/pulsefinder/.env
```

Then edit the `.env` file to add your actual values for:

- DISCORD_WEBHOOK_URL
- UPSTASH_REDIS_REST_URL
- UPSTASH_REDIS_REST_TOKEN
- QSTASH_TOKEN
- SUPABASE_ANON_KEY
- SUPABASE_URL

## Configuration for Integration

Required environment variables for connecting to Pulsefinder from other services:

```env
PULSEFINDER_API_URL=http://pulsefinder.internal
PULSEFINDER_API_KEY=your_api_key_here
```

## Development Workflow

### Running Pulsefinder

You can run pulsefinder using the Turborepo workflow:

```bash
bun run dev --filter=pulsefinder
```

### Building Pulsefinder

```bash
bun run build --filter=pulsefinder
```

### Updating the Submodule

To update the pulsefinder submodule to the latest version:

```bash
cd apps/pulsefinder
git pull origin main
cd ../..
git add apps/pulsefinder
git commit -m "Update pulsefinder submodule"
```

### Making Changes to Pulsefinder

If you need to make changes to the pulsefinder code:

1. Navigate to the submodule directory:
   ```bash
   cd apps/pulsefinder
   ```

2. Create a new branch:
   ```bash
   git checkout -b your-feature-branch
   ```

3. Make your changes, commit them, and push to the pulsefinder repository:
   ```bash
   git add .
   git commit -m "Your commit message"
   git push origin your-feature-branch
   ```

4. Create a pull request in the pulsefinder repository.

5. After your changes are merged to the main branch, update the submodule reference in the Santai repository:
   ```bash
   cd apps/pulsefinder
   git checkout main
   git pull
   cd ../..
   git add apps/pulsefinder
   git commit -m "Update pulsefinder submodule to include [feature]"
   ```

## Security

Pulsefinder is designed with security as a primary concern:
- Acts as a secure proxy between our services and the game backend
- Handles all sensitive game authentication
- Manages rate limiting and access control
- Keeps game credentials and connections isolated

## Deployment

Pulsefinder is deployed as an internal service, not exposed to the public internet:
- Only allows connections from authorized services

## Connection Management

Pulsefinder internally manages:
- Game-Account connection pool
- Automatic reconnection with exponential backoff
- Connection health monitoring
- Load balancing across multiple game servers
- Session state management

## Monitoring

Critical metrics to monitor:
- API response times
- Internal Game-Account connection health
- Connection pool status
- Rate limit usage
- Error rates
- Authentication failures

## Important Notes

- Never commit sensitive information from pulsefinder to the public Santai repository.
- Make sure `.env` files are included in `.gitignore` to prevent accidental exposure of secrets.
- The pulsefinder submodule uses its own package.json and dependencies, which are managed separately from the main project.

## Resources

- [Pulsefinder Repository](https://github.com/santaigg/pulsefinder) (Private)
- Internal API Documentation (To be added)