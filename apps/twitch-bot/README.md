# Twitch Bot

A Twitch chat bot built with modern technologies:

- **Bun**: Fast JavaScript runtime
- **TypeScript**: Type-safe JavaScript
- **Twurple**: Modern Twitch API client
- **Elysia.js**: High-performance web framework for Bun
- **Supabase**: PostgreSQL database with a powerful API

## Features

- Connect to multiple Twitch channels
- Respond to chat commands
- OAuth2 authentication with automatic token refresh
- Web interface for authorization and management
- Database storage for channel information

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) installed
- Twitch Developer Application credentials
- Supabase project

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   bun install
   ```
3. Copy `.env.example` to `.env.local` and fill in your credentials:
   ```bash
   cp .env.example .env.local
   ```

### Environment Variables

```
# Twitch API credentials
TWITCH_CLIENT_ID=your_client_id
TWITCH_CLIENT_SECRET=your_client_secret
TWITCH_REDIRECT_URI=http://localhost:3000/callback
TWITCH_BOT_USERNAME=your_bot_username
TWITCH_BOT_TOKEN=your_bot_oauth_token

# Supabase credentials
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# Discord integration
DISCORD_WEBHOOK_URL=your_discord_webhook_url

# Logging configuration
LOG_LEVEL=info  # Set to 'debug' for more detailed logs
```

### Logging Configuration

The bot uses Winston for logging and supports different log levels:

- `error`: Only log errors
- `warn`: Log warnings and errors
- `info`: Log general information (default)
- `debug`: Log detailed debug information

You can set the log level in your `.env.local` file:

```
LOG_LEVEL=debug  # For troubleshooting
```

Logs are stored in the `logs` directory:
- `logs/combined.log`: All logs
- `logs/error.log`: Error logs only
- `logs/debug.log`: Debug logs (when debug level is enabled)

### Running the Bot

Development mode:
```bash
bun run dev
```

Production mode:
```bash
bun run start
```

## Commands

Commands are located in the `src/commands` directory. Each command is a module that exports:

- `execute`: The function that runs when the command is triggered
- `aliases` (optional): An array of alternative names for the command

Example command:
```typescript
import { ChatClient, ChatMessage } from '@twurple/chat';

export const execute = async (
  client: ChatClient, 
  channel: string, 
  message: string, 
  msg: ChatMessage,
  args?: string[]
) => {
  const displayName = msg.userInfo.displayName;
  client.say(channel, `Hello, ${displayName}!`);
};

export const aliases = ['hello', 'hi'];
```

### Available Commands

#### User Commands
These commands are available to all users in any channel:

| Command | Aliases | Description |
|---------|---------|-------------|
| `!help` | `!commands`, `!info`, `!h` | Displays a list of available commands. Shows admin commands only to users with admin privileges. |
| `!rank` | none | Shows the current solo rank and team rank of the channel owner in Spectre Divide. Requires a linked player ID. |
| `!lastmatch` | none | Displays statistics from the channel owner's most recent Spectre Divide match, including kills, deaths, assists, and map. |
| `!record` | none | Shows the channel owner's win/loss record during the current stream session. |

#### Channel Owner Commands
These commands can only be used by the channel owner or moderators:

| Command | Aliases | Description |
|---------|---------|-------------|
| `!addaccount <playerID>` | none | Links a Spectre Divide player ID to the channel, enabling game-specific commands. |
| `!upgrade` | `!oauth`, `!authorize` | Upgrades the bot from IRC-only mode to OAuth mode, providing full functionality. Only usable by the channel owner. |
| `!part` | none | Makes the bot leave the channel. Can be used by the channel owner or moderators. |

#### Admin Commands
These commands can only be used by bot administrators:

| Command | Aliases | Description |
|---------|---------|-------------|
| `!addirc <channel> [playerID]` | `!joinirconly`, `!joinirc` | Adds a channel in IRC-only mode, with an optional player ID. |
| `!addoauth <channel>` | `!joinoauth`, `!addo` | Adds a channel in OAuth mode by generating an authorization link. |
| `!join <channel>` | none | Joins a channel that already exists in the database but the bot is not currently connected to. |
| `!unlink <channel>` | none | Removes a channel from the database and disconnects the bot. |

#### Superadmin Commands
These commands can only be used by superadmins:

| Command | Aliases | Description |
|---------|---------|-------------|
| `!resetdb` | none | Resets the database by deleting all channel records. This is a destructive operation. |
| `!updatetoken` | `!tokenupdate`, `!refreshtoken` | Updates the IRC token expiration date after manually refreshing the token in the environment variables. |

### Command Permissions

Commands have different permission levels:

- **Public Commands**: Available to everyone (`!help`, `!rank`, `!lastmatch`, `!record`)
- **Channel Owner Commands**: Only usable by the channel owner or moderators (`!addaccount`, `!upgrade`, `!part`)
- **Admin Commands**: Only usable by bot administrators (`!addirc`, `!addoauth`, `!join`, `!unlink`)
- **Superadmin Commands**: Only usable by superadmins (`!resetdb`, `!updatetoken`)

Additionally, some commands have different behavior based on the channel's authorization mode:

- **IRC-only Mode**: Limited to basic commands (`!help`, `!rank`, `!lastmatch`, `!record`)
- **OAuth Mode**: All commands are available

## Authorization Modes

The bot supports two authorization modes:

### OAuth Mode
OAuth mode provides full functionality with the bot operating with the channel owner's permissions:
- Requires the channel owner to authorize the bot through Twitch's OAuth flow
- Provides access to all commands and features
- Allows the bot to perform moderation actions
- Automatically refreshes tokens when they expire

### IRC-only Mode
IRC-only mode provides basic functionality without requiring OAuth authorization:
- Simple setup - just add the channel with `!addirc <channel> [playerID]`
- Limited to basic commands (`!help`, `!rank`, `!lastmatch`, `!record`)
- Cannot perform moderation actions
- Uses the bot's own credentials to connect to chat

#### Authentication Implementation
- **OAuth Mode**: Uses `RefreshingAuthProvider` from Twurple, which automatically refreshes tokens when they expire
- **IRC-only Mode**: Uses `StaticAuthProvider` from Twurple with the bot's own credentials, allowing it to join any channel's chat without special permissions

### Comparison Table

| Feature | OAuth Mode | IRC-only Mode |
|---------|-----------|--------------|
| Connection Type | Channel owner's credentials | Bot's credentials |
| Permission Level | Full (channel owner) | Limited (regular user) |
| Available Commands | All commands | Basic commands only |
| Channel Management | Can moderate chat | Cannot moderate chat |
| Token Refresh | Automatic | Not applicable (static token) |
| Setup Complexity | Requires OAuth authorization | Simple command |
| Best For | Channel owners wanting full features | Quick setup, basic functionality |

### Upgrading from IRC to OAuth

Channels can start in IRC-only mode and later upgrade to OAuth mode:
1. Channel owner types `!upgrade` in chat
2. Bot sends a private authorization link
3. Channel owner follows the link and authorizes the bot
4. Bot automatically reconnects with full permissions

### Adding Channels

There are multiple ways to add channels to the bot:

1. **IRC-only Mode**: An admin can add a channel using `!addirc <channel> [playerID]`
2. **OAuth Mode**: 
   - An admin can generate an authorization link using `!addoauth <channel>`
   - Channel owners can visit the bot's web interface and authorize directly
   - Existing IRC-only channels can upgrade using `!upgrade`

## Hybrid Approach Benefits

The bot's hybrid approach (supporting both IRC-only and OAuth modes) offers several advantages:

### For Channel Owners
- **Low Barrier to Entry**: Try the bot with basic functionality before committing to full authorization
- **Gradual Adoption**: Start with IRC-only mode and upgrade when ready for more features
- **Flexibility**: Choose the permission level that matches your comfort level
- **Privacy Control**: Decide how much access to grant to the bot

### For Bot Administrators
- **Easier Onboarding**: Add channels quickly in IRC-only mode without requiring immediate channel owner action
- **Wider Reach**: Support channels that may be hesitant to grant OAuth permissions
- **Scalability**: Manage resources efficiently by providing different service tiers
- **Resilience**: Continue basic operations even if OAuth tokens expire or are revoked

### Technical Benefits
- **Fallback Mechanism**: If OAuth authentication fails, the bot can still operate in IRC-only mode
- **Progressive Enhancement**: Core functionality works for everyone, advanced features for OAuth users
- **Simplified Testing**: Test basic functionality without complex OAuth setup
- **Reduced API Usage**: IRC-only mode requires fewer API calls to Twitch

This hybrid approach makes the bot more accessible, flexible, and resilient while still offering advanced features to channels that need them.

## Architecture

- `src/index.ts`: Entry point
- `src/server.ts`: Web server for authorization
- `src/commands/`: Chat commands
- `src/handlers/`: Event handlers
- `src/util/`: Utility functions
- `src/supabase.ts`: Database interactions
- `src/config/`: Configuration files including admin list

## Admin Configuration

The bot supports a tiered permission system with regular admins and superadmins:

### Superadmins
Superadmins have the highest level of privileges:
- Can execute destructive operations like `!resetdb`
- Can manage token expiration tracking with `!updatetoken`
- Have all the privileges of regular admins
- Can manage the entire bot infrastructure
- The bot automatically joins superadmin channels on startup, even if they're not in the database

### Regular Admins
Regular admins have elevated privileges:
- Can add player IDs to any channel
- Can make the bot leave any channel
- Can unlink any channel from the bot

To configure administrators, edit the `src/config/admins.ts` file:

```typescript
// Superadmins have full access including destructive operations
export const SUPERADMIN_USERNAMES: string[] = [
  'antiparty',
  // Add more superadmin usernames here
];

// Regular admins have elevated privileges but cannot perform destructive operations
export const ADMIN_USERNAMES: string[] = [
  // Add regular admin usernames here
];
```

The bot also includes helper functions to check permissions:
- `isSuperAdmin(username)`: Checks if a user is a superadmin
- `isAdmin(username)`: Checks if a user is a regular admin
- `hasAdminPrivileges(username)`: Checks if a user has any admin privileges (either superadmin or regular admin)
