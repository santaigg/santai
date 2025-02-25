import { type CacheType, type Interaction } from "discord.js"

import type { SlashCommand, SlashCommandInteraction } from "@/types/command"
import { type DiscordClient } from "@/lib/client"
import { Logger } from "@/lib/logger"

/**
 * Application command event
 */
export default async (interaction: Interaction<CacheType>) => {
  Logger.debug(`Received interaction: ${interaction.type}`)
  
  if (!interaction.isCommand()) return
  
  const { commandName } = interaction
  Logger.debug(`Executing command: ${commandName}`)

  await executeSlashCommand(commandName, interaction)
}

/**
 * Execute a slash command
 * @param commandName  The name of the command
 * @param interaction  The interaction object
 */
async function executeSlashCommand(
  commandName: string,
  interaction: SlashCommandInteraction
) {
  try {
    const client = interaction.client as DiscordClient
    const commandConfig = client.slashConfigs.find(
      (command) => command.name === commandName
    )

    if (!commandConfig) {
      Logger.warn(`Slash command "${commandName}" not found in config`)
      await interaction.reply({
        content: "This command is not available!",
        ephemeral: true,
      })
      return
    }

    Logger.debug(`Loading command module: ${commandConfig.fileName}`)
    const commandModule = await import(`../../commands/slash/${commandConfig.fileName}`)
    
    if (!commandModule.default?.command) {
      throw new Error('Invalid command module structure')
    }
    
    const { command }: { command: SlashCommand } = commandModule.default
    Logger.debug(`Executing command handler for: ${commandName}`)
    await command.execute(interaction)
  } catch (error) {
    Logger.error(`Error executing slash command "${commandName}": \n\t${error}`)
    await interaction.reply({
      content: "There was an error while executing this command!",
      ephemeral: true,
    })
  }
}