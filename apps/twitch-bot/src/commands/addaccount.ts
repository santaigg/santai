import { ChatClient, ChatMessage } from '@twurple/chat';
import { getChannel, upsertChannel } from '../supabase';
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
    const messageId = msg.id;
    const sanitizedChannel = channel.replace(/^#/, '');

    // Permission check
    if (
      msg.userInfo.userName !== sanitizedChannel &&
      !msg.userInfo.isMod &&  
      !hasAdminPrivileges(msg.userInfo.userName)
    ) {
      client.say(channel, `@${displayName}, you do not have permission to run this command.`, { replyTo: messageId });
      return;
    }

    // Ensure a player ID is provided
    if (!args || args.length < 1) {
      client.say(channel, `@${displayName}, please provide a valid player ID.`, { replyTo: messageId });
      return;
    }

    const playerId = args[0]; 
    logger.info(`Linking player ID: ${playerId}`);

    // Find the channel in the database
    const channelInstance = await getChannel(sanitizedChannel);

    // Get current date for token_expires_at if creating a new channel
    const currentDate = new Date();

    if (!channelInstance) {
      // Create a new channel entry if none exists
      await upsertChannel({ 
        username: sanitizedChannel, 
        player_id: playerId,
        token_expires_at: currentDate 
      });
      client.say(channel, `@${displayName}, your account has been successfully linked with player ID: ${playerId}`, { replyTo: messageId });
    } else {
      // Update the existing player_id
      await upsertChannel({
        username: sanitizedChannel,
        player_id: playerId,
        access_token: channelInstance.access_token,
        refresh_token: channelInstance.refresh_token,
        token_expires_at: channelInstance.token_expires_at
      });
      client.say(channel, `@${displayName}, your account has been successfully linked with player ID: ${playerId}`, { replyTo: messageId });
    }
  } catch (error: any) {
    logger.error(`Error executing command: ${error.message}`);
    client.say(channel, `There was an error executing the command.`);
  }
};

export const aliases = ['addaccount', 'linkaccount', 'link', 'add'];