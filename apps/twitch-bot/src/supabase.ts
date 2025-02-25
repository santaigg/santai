import { createClient } from '@supabase/supabase-js';
import type { Database } from './types/supabase';
import logger from './util/logger';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  logger.error('Missing Supabase credentials. Please set SUPABASE_URL and SUPABASE_ANON_KEY environment variables.');
  process.exit(1);
}

// Create a single supabase client for interacting with your database
export const supabase = createClient<Database>(supabaseUrl, supabaseKey);

// Helper functions for common database operations

// Channels
export async function getChannel(username: string) {
  const { data, error } = await supabase
    .from('twitch_channels')
    .select('*')
    .eq('username', username)
    .single();
  
  if (error) {
    logger.error(`Error fetching channel ${username}: ${error.message}`);
    return null;
  }
  
  return data;
}

export async function getAllChannels() {
  const { data, error } = await supabase
    .from('twitch_channels')
    .select('*');
  
  if (error) {
    logger.error(`Error fetching all channels: ${error.message}`);
    return [];
  }
  
  return data;
}

export async function getIrcOnlyChannels() {
  const { data, error } = await supabase
    .from('twitch_channels')
    .select('*')
    .eq('auth_level', 'irc');
  
  if (error) {
    logger.error(`Error fetching IRC-only channels: ${error.message}`);
    return [];
  }
  
  return data;
}

export async function getOAuthChannels() {
  const { data, error } = await supabase
    .from('twitch_channels')
    .select('*')
    .eq('auth_level', 'oauth');
  
  if (error) {
    logger.error(`Error fetching OAuth channels: ${error.message}`);
    return [];
  }
  
  return data;
}

export async function createChannel(channelData: {
  username: string;
  player_id?: string | null;
  access_token?: string | null;
  refresh_token?: string | null;
  token_expires_at: Date;
  auth_level?: string;
}) {
  // Set default auth_level based on whether access_token is provided
  if (!channelData.auth_level) {
    channelData.auth_level = channelData.access_token ? 'oauth' : 'irc';
  }
  
  const { data, error } = await supabase
    .from('twitch_channels')
    .insert([channelData])
    .select()
    .single();
  
  if (error) {
    logger.error(`Error creating channel ${channelData.username}: ${error.message}`);
    return null;
  }
  
  return data;
}

export async function addIrcOnlyChannel(username: string, player_id?: string | null) {
  const currentDate = new Date();
  
  return createChannel({
    username,
    player_id,
    token_expires_at: currentDate,
    auth_level: 'irc'
  });
}

export async function updateChannel(
  username: string,
  updates: Partial<{
    player_id: string | null;
    access_token: string | null;
    refresh_token: string | null;
    token_expires_at: Date;
    auth_level: string;
  }>
) {
  // If access_token is being set and auth_level isn't explicitly provided, upgrade to oauth
  if (updates.access_token && !updates.auth_level) {
    updates.auth_level = 'oauth';
  }
  
  const { data, error } = await supabase
    .from('twitch_channels')
    .update(updates)
    .eq('username', username)
    .select()
    .single();
  
  if (error) {
    logger.error(`Error updating channel ${username}: ${error.message}`);
    return null;
  }
  
  return data;
}

/**
 * Upgrade a channel from IRC-only to OAuth
 */
export const upgradeToOAuth = async (
    username: string,
    accessToken: string,
    refreshToken: string,
    tokenExpiresAt: Date
) => {
    try {
        const { data, error } = await supabase
            .from('twitch_channels')
            .update({
                access_token: accessToken,
                refresh_token: refreshToken,
                token_expires_at: tokenExpiresAt,
                auth_level: 'oauth'
            })
            .eq('username', username)
            .select()
            .single();

        if (error) {
            logger.error(`Error upgrading channel ${username} to OAuth: ${error.message}`);
            throw error;
        }

        logger.info(`Successfully upgraded channel ${username} from IRC-only to OAuth`);
        return data;
    } catch (error: any) {
        logger.error(`Error upgrading channel ${username} to OAuth: ${error.message}`);
        throw error;
    }
};

export async function deleteChannel(username: string) {
  const { error, count } = await supabase
    .from('twitch_channels')
    .delete()
    .eq('username', username)
    .select('count');
  
  if (error) {
    logger.error(`Error deleting channel ${username}: ${error.message}`);
    return false;
  }
  
  return count ? count > 0 : false;
}

/**
 * Upsert a channel in the database
 */
export const upsertChannel = async (data: {
  username: string;
  player_id?: string | null;
  access_token?: string | null;
  refresh_token?: string | null;
  token_expires_at?: Date;
  auth_level?: 'oauth' | 'irc';
}) => {
  try {
    // For IRC-only channels, token_expires_at is not required
    const isIrcOnly = data.auth_level === 'irc';
    
    // Set default values
    const channelData = {
      ...data,
      // Only set token_expires_at if not provided and not IRC-only
      token_expires_at: data.token_expires_at || (isIrcOnly ? null : new Date())
    };

    const { data: channel, error } = await supabase
      .from('twitch_channels')
      .upsert(channelData)
      .select()
      .single();

    if (error) {
      logger.error(`Error upserting channel ${data.username}: ${error.message}`);
      throw error;
    }

    return channel;
  } catch (error: any) {
    logger.error(`Error upserting channel ${data.username}: ${error.message}`);
    throw error;
  }
};

// Initialize the database (this doesn't create tables - that's done in Supabase UI or migrations)
export async function initializeDatabase() {
  logger.info('Supabase client initialized.');
  return true;
}

// Bot Configuration
export async function getBotConfig(key: string) {
  try {
    const { data, error } = await supabase
      .from('twitch_bot_config')
      .select('value')
      .eq('key', key)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // Record not found, which is fine
        logger.debug(`Config key ${key} not found in database`);
        return null;
      }
      logger.error(`Error fetching bot config ${key}: ${error.message}`);
      return null;
    }
    
    return data?.value;
  } catch (error: any) {
    logger.error(`Error in getBotConfig for ${key}: ${error.message}`);
    return null;
  }
}

export async function setBotConfig(key: string, value: string | null) {
  try {
    // First check if the key exists
    const exists = await getBotConfig(key);
    
    let result;
    if (exists !== null) {
      // Update existing record
      result = await supabase
        .from('twitch_bot_config')
        .update({ value, updated_at: new Date() })
        .eq('key', key)
        .select()
        .single();
    } else {
      // Insert new record
      result = await supabase
        .from('twitch_bot_config')
        .insert({ key, value, updated_at: new Date() })
        .select()
        .single();
    }
    
    const { error } = result;
    
    if (error) {
      logger.error(`Error setting bot config ${key}: ${error.message}`);
      return false;
    }
    
    logger.debug(`Successfully set config ${key} to ${value}`);
    return true;
  } catch (error: any) {
    logger.error(`Error in setBotConfig for ${key}: ${error.message}`);
    return false;
  }
}

export async function updateIrcTokenExpiration(expirationDate: Date) {
  return setBotConfig('irc_token_expires_at', expirationDate.toISOString());
}

export async function getIrcTokenExpiration(): Promise<Date | null> {
  const expirationStr = await getBotConfig('irc_token_expires_at');
  if (!expirationStr) return null;
  
  try {
    return new Date(expirationStr);
  } catch (error) {
    logger.error(`Error parsing IRC token expiration date: ${error}`);
    return null;
  }
}

export async function getNotificationDaysBefore(): Promise<number> {
  const daysStr = await getBotConfig('notification_days_before');
  if (!daysStr) return 7; // Default to 7 days
  
  try {
    return parseInt(daysStr, 10);
  } catch (error) {
    logger.error(`Error parsing notification days: ${error}`);
    return 7; // Default to 7 days
  }
}

export async function updateLastIrcExpiryNotification(date: Date | null) {
  return setBotConfig('last_irc_expiry_notification', date ? date.toISOString() : null);
}

export async function getLastIrcExpiryNotification(): Promise<Date | null> {
  const dateStr = await getBotConfig('last_irc_expiry_notification');
  if (!dateStr) return null;
  
  try {
    return new Date(dateStr);
  } catch (error) {
    logger.error(`Error parsing last IRC expiry notification date: ${error}`);
    return null;
  }
} 