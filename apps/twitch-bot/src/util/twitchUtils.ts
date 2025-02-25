import { getChannel, updateChannel } from '../supabase';
import logger from './logger';

// Function to get the stream status for a user from Twitch
export const getStreamStatusForUser = async (username: string, accessToken: string) => {
  const clientId = process.env.TWITCH_CLIENT_ID;

  if (!clientId) {
    throw new Error('Twitch Client ID is missing in environment variables.');
  }

  const url = `https://api.twitch.tv/helix/streams?user_login=${username}`;
  const response = await fetch(url, {
    headers: {
      'Client-ID': clientId,
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorDetails = await response.text(); // Capture detailed error information
    logger.error(`Failed to fetch live stream status for ${username}: ${response.statusText}`);
    logger.error(`Error details: ${errorDetails}`);
    throw new Error(`Failed to fetch live stream status: ${response.statusText}`);
  }

  const data = await response.json();
  if (data.data && data.data.length > 0) {
    const stream = data.data[0]; // First stream in the list (should be only one)
    const startTime = new Date(stream.started_at); // Stream start time

    // Validate the parsed start time
    if (isNaN(startTime.getTime())) {
      logger.error(`Invalid start time received: ${stream.started_at}`);
      throw new Error('Invalid start time received from Twitch API.');
    }

    const duration = new Date().getTime() - startTime.getTime(); // Calculate the duration in milliseconds

    // Convert the duration into a readable format (hours, minutes, seconds)
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((duration % (1000 * 60)) / 1000);
    const liveDuration = `${hours}h ${minutes}m ${seconds}s`;

    logger.info(`${username} has been live for ${liveDuration}`);

    return {
      isLive: true,
      streamStartTime: startTime.toISOString(),
      liveDuration,
      title: stream.title,
      gameName: stream.game_name,
      viewerCount: stream.viewer_count,
    };
  } else {
    logger.info(`${username} is not currently live.`);
    return {
      isLive: false,
    };
  }
};

// Function to get stream status with auto-refresh of access token if needed
export const getStreamStatusWithAutoRefresh = async (username: string) => {
  try {
    // Get the channel from the database
    const channel = await getChannel(username);

    if (!channel || !channel.access_token) {
      logger.error(`No access token found for ${username}`);
      return null;
    }

    try {
      // Try to get the stream status with the current access token
      return await getStreamStatusForUser(username, channel.access_token);
    } catch (error: any) {
      // If the request fails due to an expired token, refresh it and try again
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        logger.info(`Access token for ${username} has expired. Refreshing...`);
        const refreshed = await refreshAccessToken(channel);
        if (refreshed) {
          return await getStreamStatusForUser(username, refreshed.access_token);
        }
      }
      throw error; // Re-throw if it's not a token issue or refresh failed
    }
  } catch (error: any) {
    logger.error(`Error getting stream status for ${username}: ${error.message}`);
    return null;
  }
};

// Function to refresh an expired access token
const refreshAccessToken = async (channel: any) => {
  const clientId = process.env.TWITCH_CLIENT_ID;
  const clientSecret = process.env.TWITCH_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    logger.error('Missing Twitch API credentials');
    return null;
  }

  try {
    const response = await fetch('https://id.twitch.tv/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'refresh_token',
        refresh_token: channel.refresh_token,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error(`Failed to refresh token: ${response.statusText} - ${errorText}`);
      return null;
    }

    const data = await response.json();
    
    // Update the channel with the new tokens
    const updatedChannel = await updateChannel(channel.username, {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      token_expires_at: new Date(new Date().getTime() + data.expires_in * 1000)
    });

    logger.info(`Successfully refreshed token for ${channel.username}`);
    
    return updatedChannel;
  } catch (error: any) {
    logger.error(`Error refreshing token: ${error.message}`);
    return null;
  }
};