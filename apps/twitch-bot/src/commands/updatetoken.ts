import { ChatClient, ChatMessage } from '@twurple/chat';
import { isSuperAdmin } from '../config/admins';
import { setIrcTokenExpiration } from '../util/tokenManager';
import logger from '../util/logger';

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
    
    // Permission check - only superadmins can update token expiration
    if (!isSuperAdmin(msg.userInfo.userName)) {
      client.say(channel, `@${displayName}, you do not have permission to run this command.`, { replyTo: messageId });
      return;
    }

    // Update the token expiration date
    const success = await setIrcTokenExpiration();
    
    if (success) {
      // Get the expiration date (60 days from now)
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + 60);
      
      client.say(channel, `@${displayName}, IRC token expiration date has been updated. The token will expire on ${expirationDate.toLocaleDateString()}.`, { replyTo: messageId });
      logger.info(`IRC token expiration date updated by ${displayName}`);
    } else {
      client.say(channel, `@${displayName}, failed to update IRC token expiration date.`, { replyTo: messageId });
    }
  } catch (error: any) {
    logger.error(`Error executing updatetoken command: ${error.message}`);
    client.say(channel, `There was an error executing the command.`);
  }
};

export const aliases = ['tokenupdate', 'refreshtoken']; 