//import { deleteShowcase } from "../util/showcase.js";

export default {
  slashCommandInfo: {
    name: 'delete-user-category',
    type: 1,
    description: 'Delete a category for the specified user',
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
    deleteShowcase(interaction.guild, user, db, interaction);
  }

}