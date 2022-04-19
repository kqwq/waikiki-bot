import { createCodespace } from "../util/codespace.js";

export default {
  slashCommandInfo: {
    name: 'create-codespace',
    type: 1,
    description: 'Creates a codespace for the user',
    options: [
      {
        name: 'user',
        type: 6,
        description: 'The user to create a codespace for',
        required: true
      }
    ]
  },
  callback: async (interaction, args, client, db) => {
    let user = args.getUser('user');
    createCodespace(interaction.guild, user, db, interaction);
  }

}