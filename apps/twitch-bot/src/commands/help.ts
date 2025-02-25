import { ChatClient, ChatMessage } from '@twurple/chat';
import logger from '../util/logger';
import { hasAdminPrivileges, isAdmin, isSuperAdmin } from '../config/admins';
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
    const username = msg.userInfo.userName;
    const messageId = msg.id;
    const sanitizedChannel = channel.replace(/^#/, '');
    
    // Check if user is channel owner or moderator
    const isChannelOwner = username === sanitizedChannel;
    const isModerator = msg.userInfo.isMod;
    const isChannelOwnerOrMod = isChannelOwner || isModerator;
    
    // Check auth level of the channel
    const authLevel = await getChannelAuthLevel(sanitizedChannel);
    const isIrcOnly = authLevel === 'irc';
    
    // Basic commands for all users
    let replyMessage = `Commands: !rank (check rank), !lastmatch (last match stats), !record (overall record)`;
    
    // Add channel owner commands if applicable
    if (isChannelOwnerOrMod || hasAdminPrivileges(username)) {
      replyMessage += `, !addaccount <playerID> (link account)`;
      
      // Add part command for channel owners/mods
      replyMessage += `, !part (make bot leave)`;
      
      // Add upgrade command for channel owner (in IRC mode)
      if (isChannelOwner) {
        replyMessage += `, !upgrade (upgrade to OAuth)`;
      }
    }
    
    replyMessage += `. Need help? Join our Discord: discord.gg/santaigg`;
    
    // Add admin commands if the user has admin privileges
    if (hasAdminPrivileges(username)) {
      replyMessage += `\nAdmin commands: !addirc <channel> [playerID] (add IRC-only channel), !addoauth <channel> (add OAuth channel), !join <channel> (join existing channel), !unlink <channel> (remove channel)`;
    }
    
    // Add superadmin commands if the user is a superadmin
    if (isSuperAdmin(username)) {
      replyMessage += `\nSuperadmin commands: !resetdb (reset database), !updatetoken (update IRC token expiration)`;
    }

    // Send a reply message using Twurple's reply feature
    client.say(channel, replyMessage, { replyTo: messageId });
    
    logger.info(`Help command executed by ${displayName}`);
  } catch (error: any) {
    logger.error(`Error executing help command: ${error.message}`);
    client.say(channel, `There was an error executing the command.`);
  }
};

// Define aliases for this command
export const aliases = ['commands', 'info', 'h'];