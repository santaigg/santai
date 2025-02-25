import { Elysia } from 'elysia';
import { html } from '@elysiajs/html';
import axios from 'axios';
import { getChannel, updateChannel, getAllChannels, upsertChannel, upgradeToOAuth } from './supabase';
import { sendMessageToDiscord } from './handlers/discordHandler';
import { startChatClient, reconnectChatClient, isIrcOnlyChannel } from './util/twurpleBot';
import logger from './util/logger';

const clientId = process.env.TWITCH_CLIENT_ID;
const clientSecret = process.env.TWITCH_CLIENT_SECRET;
const redirectUri = process.env.TWITCH_REDIRECT_URI;

// Store refresh timers
const refreshTimers: { [key: string]: NodeJS.Timer } = {};

/**
 * Get the Twitch authorization URL
 */
const getAuthUrl = () => {
    // Define the scopes you need (https://dev.twitch.tv/docs/authentication/scopes/)
    const scopes = [
        'chat:read',
        'chat:edit',
        'channel:moderate',
        'moderator:manage:banned_users',
        'moderator:read:followers',
        'channel:manage:broadcast',
        'user:read:email'
    ];
    
    return `https://id.twitch.tv/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scopes.join('+')}&force_verify=true`;
};

/**
 * Refresh a Twitch access token
 */
const refreshTokenFunction = async (username: string, refreshToken: string) => {
    if (!refreshToken) {
        logger.error(`No refresh token for ${username}`);
        return;
    }

    try {
        logger.info(`[${username}] Refreshing access token...`);
        const response = await axios.post('https://id.twitch.tv/oauth2/token', null, {
            params: {
                client_id: clientId,
                client_secret: clientSecret,
                refresh_token: refreshToken,
                grant_type: 'refresh_token',
            },
        });

        const { access_token, refresh_token: newRefreshToken, expires_in } = response.data;

        const newExpirationTime = new Date(new Date().getTime() + expires_in * 1000);
        // Update database
        await updateChannel(username, {
            access_token,
            refresh_token: newRefreshToken,
            token_expires_at: newExpirationTime,
            auth_level: 'oauth'
        });

        logger.info(`[${username}] Token refreshed. Expires in ${expires_in / 60} minutes.`);

        // Schedule the next refresh
        scheduleTokenRefresh(username, newRefreshToken, expires_in * 1000 * 0.9);

        return { access_token, refresh_token: newRefreshToken };
    } catch (error: any) {
        logger.error(`[${username}] Error refreshing token: ${error.message}`);
        return null;
    }
};

/**
 * Schedule a token refresh
 */
const scheduleTokenRefresh = (username: string, refreshToken: string, refreshTime: number) => {
    // Clear any existing timer
    if (refreshTimers[username]) {
        clearTimeout(refreshTimers[username]);
    }

    // Schedule new refresh
    refreshTimers[username] = setTimeout(() => {
        refreshTokenFunction(username, refreshToken);
    }, refreshTime);
};

/**
 * Validate a Twitch access token
 */
export const validateToken = async (username: string, accessToken: string, refreshToken?: string) => {
    try {
        await axios.get('https://id.twitch.tv/oauth2/validate', {
            headers: { Authorization: `OAuth ${accessToken}` },
        });
        return true;
    } catch (error: any) {
        logger.warn(`[${username}] Token validation failed: ${error.message}`);
        
        // If we have a refresh token, try to refresh
        if (refreshToken) {
            const result = await refreshTokenFunction(username, refreshToken);
            return !!result;
        }
        
        return false;
    }
};

/**
 * Set up the Elysia server
 */
export const setupServer = (commandHandler: { [key: string]: Function }) => {
    const app = new Elysia()
        .use(html())
        
        // Home route
        .get('/', () => {
            return `
                <html>
                <head>
                    <title>Twitch Bot Authorization</title>
                    <style>
                        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
                        .button { display: inline-block; background-color: #9146FF; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; }
                    </style>
                </head>
                <body>
                    <h1>Twitch Bot Authorization</h1>
                    <p>Click the button below to authorize the bot for your Twitch channel:</p>
                    <a href="${getAuthUrl()}" class="button">Authorize Bot</a>
                </body>
                </html>
            `;
        })
        
        // Callback route
        .get('/callback', async ({ query }: { query: { code?: string } }) => {
            const { code } = query;

            if (!code) {
                return new Response('Authorization code is missing.', { status: 400 });
            }

            try {
                // Exchange code for access token
                const tokenResponse = await axios.post('https://id.twitch.tv/oauth2/token', null, {
                    params: {
                        client_id: clientId,
                        client_secret: clientSecret,
                        code: code as string,
                        grant_type: 'authorization_code',
                        redirect_uri: redirectUri,
                    },
                });

                const { access_token, refresh_token, expires_in } = tokenResponse.data;

                // Get user info
                const userResponse = await axios.get('https://api.twitch.tv/helix/users', {
                    headers: {
                        'Client-ID': clientId,
                        'Authorization': `Bearer ${access_token}`,
                    },
                });

                const { login: username } = userResponse.data.data[0];
                const expirationDate = new Date(new Date().getTime() + expires_in * 1000);

                // Check if this channel exists in our database
                const existingChannel = await getChannel(username);
                
                let channel;
                let actionType: 'new' | 'upgrade' | 'reauth' = 'new';
                
                if (existingChannel) {
                    if (existingChannel.auth_level === 'irc') {
                        // Upgrade from IRC to OAuth
                        actionType = 'upgrade';
                        channel = await upgradeToOAuth(
                            username, 
                            access_token, 
                            refresh_token, 
                            expirationDate
                        );
                        
                        // Reconnect with OAuth
                        await reconnectChatClient(username, commandHandler);
                        
                        logger.info(`Upgraded ${username} from IRC-only to OAuth`);
                    } else {
                        // Re-authorization of existing OAuth channel
                        actionType = 'reauth';
                        channel = await updateChannel(username, {
                            access_token,
                            refresh_token,
                            token_expires_at: expirationDate,
                            auth_level: 'oauth'
                        });
                        
                        // Reconnect with fresh tokens
                        await reconnectChatClient(username, commandHandler);
                        
                        logger.info(`Re-authorized ${username} with OAuth`);
                    }
                } else {
                    // New channel with OAuth
                    actionType = 'new';
                    channel = await upsertChannel({
                        username,
                        access_token,
                        refresh_token,
                        token_expires_at: expirationDate,
                        auth_level: 'oauth'
                    });
                    
                    // Join the new channel
                    await startChatClient(username, commandHandler);
                    
                    logger.info(`Added new channel ${username} with OAuth`);
                }

                // Schedule token refresh
                scheduleTokenRefresh(username, refresh_token, expires_in * 1000 * 0.9);

                // Send notification to Discord
                if (actionType === 'upgrade') {
                    await sendMessageToDiscord(`${username} has upgraded from IRC-only to OAuth!`);
                } else if (actionType === 'new') {
                    await sendMessageToDiscord(`${username} has authorized the bot with OAuth!`);
                } else {
                    await sendMessageToDiscord(`${username} has re-authorized the bot!`);
                }

                return `
                    <html>
                    <head>
                        <title>Authorization Successful</title>
                        <style>
                            body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
                        </style>
                    </head>
                    <body>
                        <h1>Authorization Successful!</h1>
                        <p>The bot has been ${
                            actionType === 'upgrade' ? 'upgraded' : 
                            actionType === 'new' ? 'authorized' : 're-authorized'
                        } for the Twitch channel: <strong>${username}</strong></p>
                        <p>You can now close this window and return to Twitch.</p>
                    </body>
                    </html>
                `;
            } catch (error: any) {
                logger.error(`Error in callback: ${error.message}`);
                return new Response('An error occurred during authorization.', { status: 500 });
            }
        })
        
        // Accounts route
        .get('/accounts', async () => {
            try {
                const accounts = await getAllChannels();
                return accounts.map(account => ({
                    username: account.username,
                    player_id: account.player_id,
                    authorized: !!account.access_token,
                    auth_level: account.auth_level || 'oauth'
                }));
            } catch (error: any) {
                logger.error(`Error fetching accounts: ${error.message}`);
                return new Response('An error occurred while fetching accounts.', { status: 500 });
            }
        });

    return app;
};