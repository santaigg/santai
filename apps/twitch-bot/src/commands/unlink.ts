import { ChatClient, ChatMessage } from '@twurple/chat';
import { deleteChannel } from '../supabase';
import { stopChatClient } from '../util/twurpleBot';
import logger from '../util/logger';
import { hasAdminPrivileges } from '../config/admins';

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
    const username = msg.userInfo.userName; // This is already lowercase
    const messageId = msg.id;
    const channelName = channel.replace(/^#/, '');

    // Permission check - only channel owner or admins can unlink
    if (username !== channelName && !hasAdminPrivileges(username)) {
      client.say(channel, `@${displayName}, you do not have permission to unlink this channel.`, { replyTo: messageId });
      return;
    }

    logger.info(`Attempting to unlink user: ${channelName}`);

    // Remove the user's tokens and channel from the database
    const deleted = await deleteChannel(channelName);

    if (deleted) {
      logger.info(`User ${channelName} unlinked from the database.`);
      
      // Say goodbye before leaving
      client.say(channel, `@${displayName}, your account has been unlinked and the bot will leave the channel.`, { replyTo: messageId });
      
      // Stop the client
      await stopChatClient(channelName);
      
      logger.info(`Unlinked and parted from ${channel}`);
    } else {
      logger.info(`User ${channelName} not found in the database.`);
      client.say(channel, `@${displayName}, your account is not linked.`, { replyTo: messageId });
    }
  } catch (error: any) {
    logger.error(`Error executing unlink command: ${error.message}`);
    client.say(channel, 'An error occurred while trying to unlink your account.');
  }
};

// Optional: Add aliases for the command
export const aliases = ['remove', 'disconnect'];