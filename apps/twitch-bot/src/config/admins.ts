/**
 * Permission configuration for the Twitch bot
 * 
 * The bot supports two levels of administrative access:
 * 
 * 1. SUPERADMIN_USERNAMES: Users with full access to all commands, including destructive operations
 *    - Can run the resetdb command to clear the database
 *    - Have all regular admin privileges
 * 
 * 2. ADMIN_USERNAMES: Users with elevated privileges for channel management
 *    - Can add player IDs to any channel
 *    - Can make the bot leave any channel
 *    - Can unlink any channel from the bot
 *    - Can run other admin-only commands (except resetdb)
 * 
 * All usernames should be lowercase as Twitch usernames are case-insensitive
 */

// Superadmins have full access to all commands, including destructive operations
export const SUPERADMIN_USERNAMES: string[] = [
  'limitediq__',
];

// Regular admins have elevated privileges but cannot perform destructive operations
export const ADMIN_USERNAMES: string[] = [
  'antiparty',
]
/**
 * Helper function to check if a username is a superadmin
 * @param username The username to check (case-insensitive)
 * @returns True if the username is in the superadmin list, false otherwise
 */
export const isSuperAdmin = (username: string): boolean => {
  return SUPERADMIN_USERNAMES.includes(username.toLowerCase());
};

/**
 * Helper function to check if a username is an admin (but not a superadmin)
 * @param username The username to check (case-insensitive)
 * @returns True if the username is in the admin list, false otherwise
 */
export const isAdmin = (username: string): boolean => {
  return ADMIN_USERNAMES.includes(username.toLowerCase());
};

/**
 * Helper function to check if a username has admin privileges (either admin or superadmin)
 * @param username The username to check (case-insensitive)
 * @returns True if the username has admin privileges, false otherwise
 */
export const hasAdminPrivileges = (username: string): boolean => {
  return isAdmin(username) || isSuperAdmin(username);
}; 