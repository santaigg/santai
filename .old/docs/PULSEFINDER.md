    # Pulsefinder Service

    Pulsefinder is our private API service that acts as an intermediary between our applications and Spectre Divide's backend services. It maintains persistent connections to game servers and exposes a REST API for other services to interact with.

    ## Overview

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

    ## Configuration

    Required environment variables for connecting to Pulsefinder:

    ```env
    PULSEFINDER_API_URL=http://pulsefinder.internal
    PULSEFINDER_API_KEY=your_api_key_here
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

    ## Resources

    - [Pulsefinder Repository](https://github.com/santaigg/pulsefinder) (Private)
    - Internal API Documentation (To be added)