import { SlashCommand, SlashCommandConfig } from "@/types/command"

const config: SlashCommandConfig = {
  name: "ping",
  description: "Show the latency of the bot",
  usage: "/ping",
  options: [
    {
      name: "emoji",
      description: "The emoji to use",
      type: "STRING",
      required: false,
    },
  ],
}

const command: SlashCommand = {
  // permissions: 0,
  execute: async (interaction) => {
    // First, send the initial reply
    await interaction.reply({
      content: "Pinging...",
    })
    
    // Then fetch the reply message
    const reply = await interaction.fetchReply()

    const emoji = interaction.options.get("emoji")?.value ?? "🏓"

    await interaction.editReply(
      `Pong ${emoji}! Latency is ${reply.createdTimestamp - interaction.createdTimestamp}ms.`
    )
  },
}

export default { command, config }
