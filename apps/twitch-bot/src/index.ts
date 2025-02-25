import { ChatClient } from '@twurple/chat';
import { RefreshingAuthProvider } from '@twurple/auth';
import { getAllChannels, getChannel, addIrcOnlyChannel } from './supabase';
import { setupServer, validateToken } from './server';
import { loadCommands } from './handlers/commands';
import { startChatClient } from './util/twurpleBot';
import { initializeTokenManager } from './util/tokenManager';
import logger from './util/logger';
import dotenv from 'dotenv';
import { SUPERADMIN_USERNAMES } from './config/admins';

// Load environment variables
dotenv.config();

// Initialize commands
const commands = loadCommands();

// Store commands globally for access from other modules
global.commandHandler = commands;

// Set up the server
const app = setupServer(commands);

// Start the server
const port = process.env.PORT || 3000;
app.listen(port as number, () => {
    logger.info(`Server is running on port ${port}`);
});

// Connect to all channels in the database and ensure superadmin channels are joined
const connectToChannels = async () => {
    try {
        // Get all channels from the database
        const channels = await getAllChannels();
        logger.info(`Found ${channels.length} channels in the database`);

        // Track which superadmin channels are already in the database
        const existingSuperadminChannels = new Set<string>();
        
        // Connect to each channel from the database
        for (const channel of channels) {
            try {
                await startChatClient(channel.username, commands);
                
                // Track if this is a superadmin channel
                if (SUPERADMIN_USERNAMES.includes(channel.username.toLowerCase())) {
                    existingSuperadminChannels.add(channel.username.toLowerCase());
                }
            } catch (error) {
                logger.error(`Error connecting to ${channel.username}: ${error}`);
            }
        }
        
        // Ensure all superadmin channels are joined, even if not in the database
        for (const superadmin of SUPERADMIN_USERNAMES) {
            if (!existingSuperadminChannels.has(superadmin.toLowerCase())) {
                logger.info(`Adding superadmin channel: ${superadmin}`);
                
                // Check if the channel exists in the database
                const existingChannel = await getChannel(superadmin);
                
                if (!existingChannel) {
                    // Add the superadmin channel to the database in IRC-only mode
                    const result = await addIrcOnlyChannel(superadmin);
                    
                    if (result) {
                        logger.info(`Added superadmin channel to database: ${superadmin}`);
                        await startChatClient(superadmin, commands);
                    } else {
                        logger.error(`Failed to add superadmin channel to database: ${superadmin}`);
                    }
                } else {
                    // Channel exists but wasn't connected for some reason
                    logger.info(`Superadmin channel exists in database but wasn't connected: ${superadmin}`);
                    await startChatClient(superadmin, commands);
                }
            }
        }
        
        logger.info('Finished connecting to all channels');
        
        // Initialize token manager for expiration tracking after channels are connected
        logger.info('Initializing token manager...');
        await initializeTokenManager().catch(error => {
            logger.error(`Failed to initialize token manager: ${error}`);
        });
    } catch (error) {
        logger.error(`Error connecting to channels: ${error}`);
    }
};

// Start the bot
connectToChannels();