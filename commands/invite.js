import config from "../config.js";

export default {
  slashCommandInfo: {
    name: 'invite',
    type: 1,
    description: 'Inviets the bot',
  },
  permission: 'everyone',
  callback: async (interaction, args, client, db) => {
    interaction.reply(`https://discord.com/api/oauth2/authorize?client_id=${config.CLIENT_ID}&permissions=2147534912&scope=bot%20applications.commands`);
  }

}