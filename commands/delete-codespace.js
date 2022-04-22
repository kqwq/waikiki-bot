import { deleteCodespace } from "../util/codespace.js";

export default {
  slashCommandInfo: {
    name: 'delete-codespace',
    type: 1,
    description: 'Delete a codespace for the specified user',
    options: [
      {
        name: 'user',
        type: 6,
        description: 'The user to delete a category for',
        required: true
      }
    ]
  },
  callback: async (interaction, args, client, db) => {
    let user = args.getUser('user');
    deleteCodespace(interaction.guild, user, db, interaction);
  }

}