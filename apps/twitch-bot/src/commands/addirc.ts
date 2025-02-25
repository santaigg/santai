import { ChatClient, ChatMessage } from '@twurple/chat';
import { addIrcOnlyChannel, getChannel } from '../supabase';
import { startChatClient } from '../util/twurpleBot';
import logger from '../util/logger';
import { hasAdminPrivileges } from '../config/admins';
import { sendMessageToDiscord } from '../handlers/discordHandler';

export const execute = async (
  client: ChatClient, 
  channel: string, 
  message: string, 
  msg: ChatMessage,
  args?: string[],
  commandHandler?: { [key: string]: Function }
) => {
  try {
    // Get user information from the message
    const displayName = msg.userInfo.displayName;
    const messageId = msg.id;
    
    // Permission check - only admins can add IRC-only channels
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
    
    // Check if player ID is provided (optional)
    const playerId = args.length > 1 ? args[1] : null;
    
    // Check if channel already exists
    const existingChannel = await getChannel(targetChannel);
    
    if (existingChannel) {
      client.say(channel, `@${displayName}, channel ${targetChannel} is already in the database.`, { replyTo: messageId });
      return;
    }
    
    // Add the IRC-only channel
    const result = await addIrcOnlyChannel(targetChannel, playerId);
    
    if (result) {
      logger.info(`Added IRC-only channel: ${targetChannel}`);
      
      // Start the chat client for this channel if commandHandler is provided
      if (commandHandler) {
        await startChatClient(targetChannel, commandHandler);
      }
      
      // Send notification to Discord
      await sendMessageToDiscord(`New IRC-only channel added: ${targetChannel}${playerId ? ` (Player ID: ${playerId})` : ''} by ${msg.userInfo.userName}`);
      
      client.say(channel, `@${displayName}, successfully added ${targetChannel} as an IRC-only channel.${playerId ? ` Player ID: ${playerId}` : ''}`, { replyTo: messageId });
    } else {
      client.say(channel, `@${displayName}, failed to add ${targetChannel} as an IRC-only channel.`, { replyTo: messageId });
    }
  } catch (error: any) {
    logger.error(`Error executing addirc command: ${error.message}`);
    client.say(channel, `There was an error executing the command.`);
  }
};

export const aliases = ['addirc', 'joinirconly', 'joinirc']; 