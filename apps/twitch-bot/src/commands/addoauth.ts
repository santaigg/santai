import { ChatClient, ChatMessage } from '@twurple/chat';
import { getChannel } from '../supabase';
import logger from '../util/logger';
import { hasAdminPrivileges } from '../config/admins';
import { sendMessageToDiscord } from '../handlers/discordHandler';

export const execute = async (
  client: ChatClient, 
  channel: string, 
  message: string, 
  msg: ChatMessage,
  args?: string[]
) => {
  try {
    // Get user information from the message
    const displayName = msg.userInfo.displayName;
    const messageId = msg.id;
    
    // Permission check - only admins can add OAuth channels
    if (!hasAdminPrivileges(msg.userInfo.userName)) {
      client.say(channel, `@${displayName}, you do not have permission to run this command.`, { replyTo: messageId });
      return;
    }

    // Ensure a channel name is provided
    if (!args || args.length < 1) {
      client.say(channel, `@${displayName}, please provide a channel name to add.`, { replyTo: messageId });
      return;
    }

    const targetChannel = args[0].toLowerCase().replace(/^#/, '');
    
    // Check if channel already exists
    const existingChannel = await getChannel(targetChannel);
    
    if (existingChannel) {
      client.say(channel, `@${displayName}, channel ${targetChannel} is already in the database.`, { replyTo: messageId });
      return;
    }
    
    // Get the authorization URL from environment
    const clientId = process.env.TWITCH_CLIENT_ID;
    const redirectUri = process.env.TWITCH_REDIRECT_URI;
    
    if (!clientId || !redirectUri) {
      logger.error('Missing client ID or redirect URI');
      client.say(channel, `@${displayName}, sorry, there was an error generating the authorization link.`, { replyTo: messageId });
      return;
    }
    
    // Generate the authorization URL
    const scopes = [
      'chat:read',
      'chat:edit',
      'channel:moderate',
      'moderator:manage:banned_users',
      'moderator:read:followers',
      'channel:manage:broadcast',
      'user:read:email'
    ];
    
    const authUrl = `https://id.twitch.tv/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scopes.join('+')}&force_verify=true`;
    
    // Send notification to Discord
    await sendMessageToDiscord(`OAuth authorization link generated for channel ${targetChannel} by ${msg.userInfo.userName}`);
    
    // Send the authorization message
    client.say(channel, `@${displayName}, to add ${targetChannel} with OAuth permissions, please have them visit: ${authUrl}`, { replyTo: messageId });
    logger.info(`OAuth authorization link for ${targetChannel} sent to ${displayName}`);
  } catch (error: any) {
    logger.error(`Error executing addoauth command: ${error.message}`);
    client.say(channel, `There was an error executing the command.`);
  }
};

export const aliases = ['addoauth', 'joinoauth', 'addo']; 