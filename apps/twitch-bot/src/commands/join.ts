import { ChatClient, ChatMessage } from '@twurple/chat';
import { hasAdminPrivileges } from '../config/admins';
import { getChannel, upsertChannel } from '../supabase';
import { startChatClient } from '../util/twurpleBot';
import logger from '../util/logger';

// Declare global commandHandler
declare global {
  var commandHandler: { [key: string]: Function };
}

/**
 * Join a channel in IRC-only mode
 */
export const execute = async (
  client: ChatClient,
  channel: string,
  message: string,
  msg: ChatMessage,
  args?: string[]
) => {
  const displayName = msg.userInfo.displayName;
  const messageId = msg.id;
  
  // Check if user has admin privileges
  if (!hasAdminPrivileges(msg.userInfo.userName)) {
    client.say(channel, `@${displayName} You don't have permission to use this command.`, { replyTo: messageId });
    return;
  }
  
  // Check if a channel name was provided
  if (!args || args.length === 0) {
    client.say(channel, `@${displayName} Please specify a channel name to join.`, { replyTo: messageId });
    return;
  }
  
  // Get the channel name from args
  const targetChannel = args[0].toLowerCase().replace(/^#/, '');
  
  try {
    // Check if the channel already exists
    const existingChannel = await getChannel(targetChannel);
    
    if (existingChannel) {
      client.say(channel, `@${displayName} The bot is already in channel #${targetChannel}.`, { replyTo: messageId });
      return;
    }
    
    // Add the channel to the database in IRC-only mode
    await upsertChannel({
      username: targetChannel,
      auth_level: 'irc'
    });
    
    // Join the channel
    await startChatClient(targetChannel, global.commandHandler);
    
    client.say(channel, `@${displayName} Successfully joined #${targetChannel} in IRC-only mode. The channel owner can use !upgrade to authorize the bot with OAuth.`, { replyTo: messageId });
    logger.info(`Admin ${msg.userInfo.userName} added channel ${targetChannel} in IRC-only mode`);
  } catch (error: any) {
    client.say(channel, `@${displayName} Error joining channel #${targetChannel}: ${error.message}`, { replyTo: messageId });
    logger.error(`Error joining channel ${targetChannel}: ${error.message}`);
  }
};

export const aliases = ['join', 'addchannel']; 