

export default {
  slashCommandInfo: {
    name: 'set-slot',
    type: 1,
    description: 'Pings the bot',
  },
  callback: async (interaction, args, client, db) => {
    interaction.reply('pong');
  }

}