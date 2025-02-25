import { ChatClient, ChatMessage } from '@twurple/chat';
import { supabase } from '../supabase';
import logger from '../util/logger';
import { isSuperAdmin } from '../config/admins';

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
    const username = displayName || 'user';

    // Only allow the command to be run by superadmins
    if (!isSuperAdmin(msg.userInfo.userName)) {
      client.say(channel, `@${displayName}, you do not have permission to run this command. Only superadmins can reset the database.`);
      return;
    }
    
    const replyMessage = `Database reset initiated. This may take a few seconds...`;
    
    // Delete all records in the database
    const { error } = await supabase.from('twitch_channels').delete().neq('id', 0);
    
    if (error) {
      logger.error(`Error resetting database: ${error.message}`);
      client.say(channel, `Error resetting database.`, { replyTo: messageId });
      return;
    }

    client.say(channel, replyMessage, { replyTo: messageId });
    logger.info('Database reset completed successfully');
  } catch (error: any) {
    logger.error(`Error executing command: ${error.message}`);
    client.say(channel, `There was an error executing the command.`);
  }
};

export const aliases = ['resetdb', 'cleardb', 'clear', 'reset'];