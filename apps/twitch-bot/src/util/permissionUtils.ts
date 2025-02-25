import { getChannel } from '../supabase';
import { isIrcOnlyChannel } from './twurpleBot';
import logger from './logger';

// Define which commands are allowed for IRC-only channels
const IRC_ALLOWED_COMMANDS = [
  'addaccount',
  'addirc',
  'addoauth',
  'help',
  'join',
  'lastmatch',
  'part',
  'rank',
  'record',
  'resetdb',
  'unlink',
  'upgrade',
  'updatetoken'
];

// Define which commands require OAuth - these should be commands that actually need OAuth permissions
// Currently, there are no commands that strictly require OAuth to function
const OAUTH_REQUIRED_COMMANDS: string[] = [
  // Empty for now as all current commands can work with IRC
];

/**
 * Check if a command is allowed for the given channel based on auth level
 * @param channelName The channel name
 * @param commandName The command name without the ! prefix
 * @returns Promise<boolean> True if the command is allowed
 */
export const isCommandAllowedForChannel = async (channelName: string, commandName: string): Promise<boolean> => {
  try {
    // Normalize inputs
    const normalizedChannel = channelName.replace(/^#/, '');
    const normalizedCommand = commandName.replace(/^!/, '').toLowerCase();
    
    // Check if the channel is IRC-only
    const isIrc = await isIrcOnlyChannel(normalizedChannel);
    
    if (isIrc) {
      // For IRC-only channels, only allow specific commands
      return IRC_ALLOWED_COMMANDS.includes(normalizedCommand);
    }
    
    // For OAuth channels, allow all commands
    return true;
  } catch (error: any) {
    logger.error(`Error checking command permissions: ${error.message}`);
    return false;
  }
};

/**
 * Check if a command requires OAuth
 * @param commandName The command name without the ! prefix
 * @returns boolean True if the command requires OAuth
 */
export const doesCommandRequireOAuth = (commandName: string): boolean => {
  const normalizedCommand = commandName.replace(/^!/, '').toLowerCase();
  return OAUTH_REQUIRED_COMMANDS.includes(normalizedCommand);
};

/**
 * Get the auth level for a channel
 * @param channelName The channel name
 * @returns Promise<string> The auth level ('irc' or 'oauth')
 */
export const getChannelAuthLevel = async (channelName: string): Promise<string> => {
  try {
    const normalizedChannel = channelName.replace(/^#/, '');
    const channelData = await getChannel(normalizedChannel);
    
    if (!channelData) {
      logger.warn(`Channel ${normalizedChannel} not found in database`);
      return 'unknown';
    }
    
    return channelData.auth_level || 'oauth';
  } catch (error: any) {
    logger.error(`Error getting channel auth level: ${error.message}`);
    return 'unknown';
  }
}; 