//import { initShowcase } from "../util/showcase.js";

export default {
  slashCommandInfo: {
    name: 'create-user-channel',
    type: 1,
    description: 'Creates a category for the user',
    options: [
      {
        name: 'type',
        type: 3,
        description: 'The type of channel to create',
        required: true,
        choices: [
          {
            name: 'Public',
            value: 'public',
            description: 'A public channel - anyone can send messages'
          },
          {
            name: 'Private',
            value: 'private',
            description: 'A public channel - only you can send messages'
          },
          {
            name: 'Voice',
            value: 'voice',
            description: 'A voice channel'
          },
          {
            name: 'Announcement',
            value: 'announcement',
            description: 'A announcement channel - other servers can follow this channel'
          }
        ]
      },
      {
        name: 'name',
        type: 3,
        description: 'The name of the channel',
      },
      {
        name: 'for',
        type: 6,
        description: 'The user to create a channel for',
      }
    ]
  },
  callback: async (interaction, args, client, db) => {
    let user = args.getUser('user');
    initShowcase(interaction.guild, user, db, interaction);
  }

}