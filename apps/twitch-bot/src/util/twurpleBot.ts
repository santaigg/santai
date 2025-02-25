import { ChatClient } from '@twurple/chat';
import { RefreshingAuthProvider, StaticAuthProvider } from '@twurple/auth';
import { ApiClient } from '@twurple/api';
import { getChannel, updateChannel } from '../supabase';
import logger from './logger';
import { setIrcTokenExpiration } from './tokenManager';

// Track connected channels
const connectedChannels: Set<string> = new Set();

// Store chat clients for each channel
const chatClients: Map<string, ChatClient> = new Map();

// Store API clients for each channel
const apiClients: Map<string, ApiClient> = new Map();

// Store auth type for each channel
const channelAuthTypes: Map<string, 'oauth' | 'irc'> = new Map();

/**
 * Create a refreshing auth provider for a channel
 */
export const createAuthProvider = async (username: string) => {
  try {
    const channel = await getChannel(username);
    
    if (!channel || !channel.access_token || !channel.refresh_token) {
      logger.error(`Missing tokens for ${username}`);
      return null;
    }

    const authProvider = new RefreshingAuthProvider({
      clientId: process.env.TWITCH_CLIENT_ID!,
      clientSecret: process.env.TWITCH_CLIENT_SECRET!,
    });

    // Set initial tokens
    await authProvider.addUserForToken({
      accessToken: channel.access_token,
      refreshToken: channel.refresh_token,
      expiresIn: 0, // Force a refresh on first use
      obtainmentTimestamp: 0
    }, ['chat']);

    // Set up token refresh callback
    authProvider.onRefresh(async (userId, newTokenData) => {
      try {
        logger.info(`Refreshed token for user ${userId} (${username})`);
        
        // Calculate expiration time
        const expiresAt = new Date();
        expiresAt.setSeconds(expiresAt.getSeconds() + (newTokenData.expiresIn || 0));
        
        // Update tokens in database
        await updateChannel(username, {
          access_token: newTokenData.accessToken,
          refresh_token: newTokenData.refreshToken,
          token_expires_at: expiresAt
        });
      } catch (error: any) {
        logger.error(`Failed to update tokens for ${username}: ${error.message}`);
      }
    });

    return authProvider;
  } catch (error: any) {
    logger.error(`Error creating auth provider for ${username}: ${error.message}`);
    return null;
  }
};

/**
 * Create a basic auth provider for IRC-only mode using the bot's credentials
 */
export const createIrcAuthProvider = async () => {
  try {
    const botUsername = process.env.TWITCH_BOT_USERNAME;
    const botToken = process.env.TWITCH_BOT_TOKEN;
    const clientId = process.env.TWITCH_CLIENT_ID;
    
    logger.debug(`Creating IRC auth provider with bot username: ${botUsername}`);
    
    if (!botUsername || !botToken) {
      logger.error('Missing bot credentials for IRC mode');
      if (!botUsername) logger.error('TWITCH_BOT_USERNAME is not set');
      if (!botToken) logger.error('TWITCH_BOT_TOKEN is not set');
      return null;
    }

    if (!clientId) {
      logger.error('TWITCH_CLIENT_ID is not set');
      return null;
    }

    logger.debug(`Creating StaticAuthProvider with client ID: ${clientId.substring(0, 5)}... and token: ${botToken.substring(0, 5)}...`);
    
    // Use StaticAuthProvider instead of RefreshingAuthProvider for IRC-only mode
    const authProvider = new StaticAuthProvider(
      clientId,
      botToken,
      ['chat:read', 'chat:edit']
    );

    logger.debug('StaticAuthProvider created successfully');

    // Set the token expiration date (60 days from now)
    await setIrcTokenExpiration();
    logger.debug('IRC token expiration date set');

    return authProvider;
  } catch (error: any) {
    logger.error(`Error creating IRC auth provider: ${error.message}`);
    if (error.stack) {
      logger.debug(`Stack trace: ${error.stack}`);
    }
    return null;
  }
};

/**
 * Start a chat client for a channel
 * This function will automatically determine whether to use OAuth or IRC-only mode
 */
export const startChatClient = async (
  username: string, 
  commandHandler: { [key: string]: Function }
) => {
  try {
    const sanitizedUsername = username.replace(/^#/, '');
    logger.debug(`Attempting to start chat client for ${sanitizedUsername}`);
    
    // Check if already connected
    if (connectedChannels.has(sanitizedUsername)) {
      logger.info(`Already connected to ${sanitizedUsername}`);
      return chatClients.get(sanitizedUsername) || null;
    }

    // Get channel data
    const channel = await getChannel(sanitizedUsername);
    if (!channel) {
      logger.error(`Channel ${sanitizedUsername} not found in database`);
      return null;
    }
    logger.debug(`Retrieved channel data for ${sanitizedUsername}: auth_level=${channel.auth_level}`);

    // Determine auth type
    const authType = channel.auth_level || 'oauth';
    let authProvider;

    if (authType === 'irc') {
      // Use IRC-only mode with bot credentials
      logger.info(`Using IRC-only mode for ${sanitizedUsername}`);
      authProvider = await createIrcAuthProvider();
      if (!authProvider) {
        logger.error(`Could not create IRC auth provider for ${sanitizedUsername}`);
        return null;
      }
      logger.debug(`Successfully created IRC auth provider for ${sanitizedUsername}`);
    } else {
      // Use OAuth mode with channel credentials
      logger.info(`Using OAuth mode for ${sanitizedUsername}`);
      authProvider = await createAuthProvider(sanitizedUsername);
      if (!authProvider) {
        logger.error(`Could not create OAuth auth provider for ${sanitizedUsername}`);
        return null;
      }
      logger.debug(`Successfully created OAuth auth provider for ${sanitizedUsername}`);

      // Create API client for OAuth channels
      const apiClient = new ApiClient({ authProvider });
      apiClients.set(sanitizedUsername, apiClient);
      logger.debug(`Created API client for ${sanitizedUsername}`);
    }

    // Create chat client
    logger.debug(`Creating chat client for ${sanitizedUsername}`);
    const chatClient = new ChatClient({ 
      authProvider,
      channels: [sanitizedUsername],
      // Use logger for debug messages
      logger: {
        custom: {
          log: (msg) => {
            // Filter out the "7" messages
            if (msg && msg.toString() !== "7") {
              logger.info(`[Twurple] ${msg}`);
            }
          },
          debug: (msg) => {
            // Filter out the "7" messages
            if (msg && msg.toString() !== "7") {
              logger.debug(`[Twurple] ${msg}`);
            }
          },
          info: (msg) => {
            // Filter out the "7" messages
            if (msg && msg.toString() !== "7") {
              logger.info(`[Twurple] ${msg}`);
            }
          },
          warn: (msg) => logger.warn(`[Twurple] ${msg}`),
          error: (msg) => logger.error(`[Twurple] ${msg}`)
        }
      }
    });

    // Set up event handlers
    chatClient.onMessage(async (channel, user, message, msg) => {
      try {
        // Enhanced logging for all messages
        const channelName = channel.replace('#', '');
        logger.debug(`Chat message received - Channel: ${channelName}, User: ${user}, Message: ${message}`);
        
        // Skip messages from the bot itself
        if (user.toLowerCase() === process.env.TWITCH_BOT_USERNAME?.toLowerCase()) {
          logger.debug(`Skipping message from bot itself in ${channelName}`);
          return;
        }

        // Extract command
        const parts = message.trim().split(' ');
        const command = parts[0].toLowerCase();
        const args = parts.slice(1);

        // Check if command exists and execute it
        if (commandHandler[command]) {
          logger.debug(`Executing command ${command} in ${channelName} by ${user}`);
          try {
            await commandHandler[command](chatClient, channel, message, msg, args);
          } catch (error: any) {
            logger.error(`Error executing command ${command}: ${error.message}`);
          }
        }
      } catch (error: any) {
        logger.error(`Error in message handler: ${error.message}`);
      }
    });

    // Add additional event handlers for debugging
    chatClient.onConnect(() => {
      logger.debug(`Connected to Twitch chat for channel: ${sanitizedUsername}`);
    });

    chatClient.onDisconnect((manual, reason) => {
      logger.debug(`Disconnected from Twitch chat for channel: ${sanitizedUsername}. Manual: ${manual}, Reason: ${reason}`);
    });

    chatClient.onJoin((channel, user) => {
      logger.debug(`${user} joined ${channel}`);
    });

    chatClient.onPart((channel, user) => {
      logger.debug(`${user} left ${channel}`);
    });

    // Connect to Twitch
    logger.debug(`Attempting to connect to Twitch for ${sanitizedUsername}`);
    await chatClient.connect();
    logger.info(`Connected to ${sanitizedUsername} using ${authType} mode`);
    
    // Store client and mark as connected
    chatClients.set(sanitizedUsername, chatClient);
    connectedChannels.add(sanitizedUsername);
    channelAuthTypes.set(sanitizedUsername, authType as 'oauth' | 'irc');
    logger.debug(`Chat client for ${sanitizedUsername} is now stored and marked as connected`);

    return chatClient;
  } catch (error: any) {
    logger.error(`Error starting chat client for ${username}: ${error.message}`);
    if (error.stack) {
      logger.debug(`Stack trace: ${error.stack}`);
    }
    return null;
  }
};

/**
 * Stop a chat client for a channel
 */
export const stopChatClient = async (username: string) => {
  try {
    const sanitizedUsername = username.replace(/^#/, '');
    
    // Get client
    const chatClient = chatClients.get(sanitizedUsername);
    if (!chatClient) {
      logger.warn(`No chat client found for ${sanitizedUsername}`);
      return false;
    }

    // Disconnect
    await chatClient.quit();
    
    // Clean up
    chatClients.delete(sanitizedUsername);
    connectedChannels.delete(sanitizedUsername);
    channelAuthTypes.delete(sanitizedUsername);
    
    logger.info(`Disconnected from ${sanitizedUsername}`);
    return true;
  } catch (error: any) {
    logger.error(`Error stopping chat client for ${username}: ${error.message}`);
    return false;
  }
};

/**
 * Reconnect a chat client for a channel
 */
export const reconnectChatClient = async (
  username: string, 
  commandHandler: { [key: string]: Function }
) => {
  const sanitizedUsername = username.replace(/^#/, '');
  
  await stopChatClient(username);
  return startChatClient(username, commandHandler);
};

/**
 * Get the API client for a channel
 */
export const getApiClient = (username: string): ApiClient | null => {
  const sanitizedUsername = username.replace(/^#/, '');
  return apiClients.get(sanitizedUsername) || null;
};

/**
 * Get the chat client for a channel
 */
export const getChatClient = (username: string): ChatClient | null => {
  const sanitizedUsername = username.replace(/^#/, '');
  return chatClients.get(sanitizedUsername) || null;
};

/**
 * Check if a channel is using IRC-only mode
 */
export const isIrcOnlyChannel = async (username: string): Promise<boolean> => {
    try {
        const channel = await getChannel(username);
        return channel?.auth_level === 'irc';
    } catch (error) {
        logger.error(`Error checking if ${username} is IRC-only: ${error}`);
        return false;
    }
}; 