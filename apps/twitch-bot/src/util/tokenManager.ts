import { 
  getIrcTokenExpiration, 
  updateIrcTokenExpiration, 
  getNotificationDaysBefore,
  getLastIrcExpiryNotification,
  updateLastIrcExpiryNotification
} from '../supabase';
import { sendMessageToDiscord } from '../handlers/discordHandler';
import logger from './logger';

/**
 * Set the expiration date for the IRC token
 * This should be called when the bot starts or when the token is updated
 */
export const setIrcTokenExpiration = async () => {
  try {
    // Twitch tokens typically expire in 60 days
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 60);
    
    await updateIrcTokenExpiration(expirationDate);
    logger.info(`Set IRC token expiration to ${expirationDate.toISOString()}`);
    
    return true;
  } catch (error) {
    logger.error(`Error setting IRC token expiration: ${error}`);
    return false;
  }
};

/**
 * Check if the IRC token is about to expire and send a notification if needed
 */
export const checkIrcTokenExpiration = async () => {
  try {
    const expirationDate = await getIrcTokenExpiration();
    if (!expirationDate) {
      logger.warn('IRC token expiration date not set');
      return;
    }
    
    const now = new Date();
    
    // Get notification threshold days with proper error handling
    let daysBefore = 7; // Default value
    try {
      daysBefore = await getNotificationDaysBefore();
      logger.debug(`Notification threshold set to ${daysBefore} days before expiration`);
    } catch (error) {
      logger.error(`Error getting notification days, using default (7): ${error}`);
    }
    
    const notificationThreshold = new Date(expirationDate);
    notificationThreshold.setDate(notificationThreshold.getDate() - daysBefore);
    
    // If we're past the notification threshold but haven't sent a notification yet
    if (now >= notificationThreshold) {
      const lastNotification = await getLastIrcExpiryNotification();
      
      // If we haven't sent a notification yet or it was sent more than a day ago
      if (!lastNotification || (now.getTime() - lastNotification.getTime() > 24 * 60 * 60 * 1000)) {
        const daysRemaining = Math.ceil((expirationDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
        
        // Send notification to Discord
        const message = `⚠️ **IRC TOKEN EXPIRATION ALERT** ⚠️\n\nThe IRC token will expire in ${daysRemaining} days (on ${expirationDate.toLocaleDateString()}).\n\nPlease update the \`TWITCH_BOT_TOKEN\` in the \`.env.local\` file with a fresh token to ensure uninterrupted IRC-only mode operation.`;
        await sendMessageToDiscord(message);
        
        // Update last notification timestamp
        await updateLastIrcExpiryNotification(now);
        
        logger.info(`Sent IRC token expiration notification. Token expires in ${daysRemaining} days.`);
      }
    }
  } catch (error) {
    logger.error(`Error checking IRC token expiration: ${error}`);
  }
};

/**
 * Initialize the token manager
 * This sets up the initial expiration date and schedules regular checks
 */
export const initializeTokenManager = async () => {
  try {
    // Set initial expiration date if not already set
    const currentExpiration = await getIrcTokenExpiration();
    if (!currentExpiration) {
      await setIrcTokenExpiration();
      logger.info('Set initial IRC token expiration date');
    } else {
      logger.info(`Current IRC token expiration date: ${currentExpiration.toISOString()}`);
    }
    
    // Schedule regular checks (every 24 hours)
    setInterval(checkIrcTokenExpiration, 24 * 60 * 60 * 1000);
    
    // Delay the first check by 5 minutes to avoid startup issues
    logger.info('Scheduling first token expiration check in 5 minutes');
    setTimeout(checkIrcTokenExpiration, 5 * 60 * 1000);
    
    logger.info('Token manager initialized');
  } catch (error) {
    logger.error(`Error initializing token manager: ${error}`);
  }
}; 