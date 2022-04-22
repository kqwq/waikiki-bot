const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export default {
  slashCommandInfo: {
    name: 'restart',
    type: 1,
    description: 'Restarts the bot',
  },
  access: 'admin',
  callback: async (interaction, args, client, db) => {
    interaction.reply('Restarting...');
    await sleep(500);
    process.exit(77); // Restart code
  }

}