# Supabase Setup for Twitch Bot

This directory contains the Supabase migration scripts for the Twitch bot database.

## Setup Instructions

1. Create a new Supabase project at [https://app.supabase.io](https://app.supabase.io)
2. Get your Supabase URL and anon key from the project settings
3. Add these to your `.env` file:
   ```
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   ```

## Database Schema

### Channels Table

The `twitch_channels` table stores information about Twitch channels that have authorized the bot.

| Column           | Type                      | Description                                |
|------------------|---------------------------|--------------------------------------------|
| id               | SERIAL                    | Primary key                                |
| username         | TEXT                      | Twitch username (unique)                   |
| player_id        | TEXT                      | Player ID for game integration (optional)  |
| access_token     | TEXT                      | Twitch OAuth access token                  |
| refresh_token    | TEXT                      | Twitch OAuth refresh token                 |
| token_expires_at | TIMESTAMP WITH TIME ZONE  | When the access token expires              |
| created_at       | TIMESTAMP WITH TIME ZONE  | When the record was created                |
| updated_at       | TIMESTAMP WITH TIME ZONE  | When the record was last updated           |

## Using the Supabase Client

The Twitch bot uses the Supabase TypeScript client to interact with the database. The client is initialized in `src/supabase.ts` and provides helper functions for common database operations.

Example usage:

```typescript
import { getChannel, updateChannel, getAllChannels } from './supabase';

// Get a channel
const channel = await getChannel('twitchusername');

// Update a channel
await updateChannel('twitchusername', { player_id: 'new-player-id' });

// Get all channels
const allChannels = await getAllChannels();
```