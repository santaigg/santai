import { ChatClient, ChatMessage } from '@twurple/chat';
import logger from '../util/logger';
import { stopChatClient } from '../util/twurpleBot';
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
    
    // Extract channel name without the # prefix
    const channelName = channel.replace(/^#/, '');
    
    // Permission check - only channel owner or admins can make the bot leave
    if (msg.userInfo.userName !== channelName && !hasAdminPrivileges(msg.userInfo.userName)) {
      client.say(channel, `@${displayName}, you do not have permission to run this command.`, { replyTo: messageId });
      return;
    }
    
    // Say goodbye before leaving
    client.say(channel, `Goodbye! I'm leaving this channel as requested by ${displayName}.`, { replyTo: messageId });
    
    // Send notification to Discord
    await sendMessageToDiscord(`Bot has left channel ${channelName} as requested by ${displayName}`);
    
    // Use the stopChatClient function to properly disconnect
    await stopChatClient(channelName);
    
    logger.info(`Bot left channel: ${channel} as requested by ${displayName}`);
  } catch (error: any) {
    logger.error(`Error executing part command: ${error.message}`);
  }
};

// Define aliases for this command
export const aliases = ['leave', 'part'];