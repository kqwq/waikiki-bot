const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export default {
  slashCommandInfo: {
    name: 'exit',
    type: 1,
    description: 'Shuts down the bot',
  },
  permission: 'admin',
  callback: async (interaction, args, client, db) => {
    interaction.reply('Shutting down...');
    await sleep(500);
    process.exit(0); // Restart code
  }

}