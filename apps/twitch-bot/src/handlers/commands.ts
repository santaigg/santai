import fs from 'fs';
import path from 'path';
import logger from '../util/logger';
import { isCommandAllowedForChannel, doesCommandRequireOAuth } from '../util/permissionUtils';
import { getChannelAuthLevel } from '../util/permissionUtils';

export const loadCommands = () => {
    const commandsDir = path.resolve(__dirname, '../commands');
    logger.info(`Loading commands from: ${commandsDir}`);
    const commandFiles = fs.readdirSync(commandsDir).filter(file => file.endsWith('.ts') || file.endsWith('.js'));
    const commandHandler: { [key: string]: Function } = {};

    commandFiles.forEach(file => {
        const commandName = path.basename(file, path.extname(file));
        try {
            const command = require(path.join(commandsDir, file));

            if (command && typeof command.execute === 'function') {
                // Create a wrapper function that passes the commandHandler to the command
                commandHandler[`!${commandName.toLowerCase()}`] = async (client: any, channel: string, message: string, msg: any, args?: string[]) => {
                    // Check if the command is allowed for this channel
                    const isAllowed = await isCommandAllowedForChannel(channel, commandName);
                    
                    if (!isAllowed) {
                        const authLevel = await getChannelAuthLevel(channel);
                        if (authLevel === 'irc' && doesCommandRequireOAuth(commandName)) {
                            client.say(channel, `@${msg.userInfo.displayName}, this command requires OAuth authorization. Please visit our website to authorize the bot with full permissions.`, { replyTo: msg.id });
                            return;
                        }
                        
                        logger.warn(`Command ${commandName} not allowed for channel ${channel}`);
                        return;
                    }
                    
                    return command.execute(client, channel, message, msg, args, commandHandler);
                };

                if (command.aliases && Array.isArray(command.aliases)) {
                    command.aliases.forEach((alias: string) => {
                        commandHandler[`!${alias.toLowerCase()}`] = async (client: any, channel: string, message: string, msg: any, args?: string[]) => {
                            // Check if the command is allowed for this channel
                            const isAllowed = await isCommandAllowedForChannel(channel, commandName);
                            
                            if (!isAllowed) {
                                const authLevel = await getChannelAuthLevel(channel);
                                if (authLevel === 'irc' && doesCommandRequireOAuth(commandName)) {
                                    client.say(channel, `@${msg.userInfo.displayName}, this command requires OAuth authorization. Please visit our website to authorize the bot with full permissions.`, { replyTo: msg.id });
                                    return;
                                }
                                
                                logger.warn(`Command ${alias} (alias of ${commandName}) not allowed for channel ${channel}`);
                                return;
                            }
                            
                            return command.execute(client, channel, message, msg, args, commandHandler);
                        };
                    });
                }
                
                logger.info(`Loaded command: ${commandName} with ${command.aliases ? command.aliases.length : 0} aliases`);
            }
        } catch (err: any) {
            logger.error(`Error loading command "${file}": ${err.message}`);
        }
    });

    return commandHandler;
};

