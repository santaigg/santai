import { ChatClient, ChatMessage } from '@twurple/chat';
import { getChannel } from '../supabase';
import logger from '../util/logger';
import { getChannelAuthLevel } from '../util/permissionUtils';

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
    const sanitizedChannel = channel.replace(/^#/, '');
    
    // Only channel owner can upgrade
    if (msg.userInfo.userName !== sanitizedChannel) {
      client.say(channel, `@${displayName}, only the channel owner can upgrade the bot.`, { replyTo: messageId });
      return;
    }
    
    // Check current auth level
    const authLevel = await getChannelAuthLevel(sanitizedChannel);
    
    if (authLevel === 'oauth') {
      client.say(channel, `@${displayName}, your channel is already using OAuth with full permissions.`, { replyTo: messageId });
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
    
    // Send the upgrade message
    client.say(channel, `@${displayName}, to upgrade the bot with full permissions, please visit: ${authUrl}`, { replyTo: messageId });
    logger.info(`Upgrade link sent to ${sanitizedChannel}`);
  } catch (error: any) {
    logger.error(`Error executing upgrade command: ${error.message}`);
    client.say(channel, `There was an error executing the command.`);
  }
};

export const aliases = ['upgrade', 'oauth', 'authorize']; 