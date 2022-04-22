import { ActivityType } from 'discord-api-types/v9';
import { setInfoMessage } from '../util/infoChannel.js';

export default {
  slashCommandInfo: {
    name: 'bot-status',
    type: 1,
    description: 'Changes the bot status.',
    options: [
      {
        name: 'status-text',
        type: 3,
        description: 'The status text to set',
        required: true
      },
      {
        name: 'status-type',
        type: 4,
        description: 'The status type to set',
        required: true,
        choices: [
          {
            name: 'Playing',
            value: ActivityType.Game,
          },
          {
            name: 'Streaming',
            value: ActivityType.Streaming,
          },
          {
            name: 'Listening to',
            value: ActivityType.Listening,
          },
          {
            name: 'Watching',
            value: ActivityType.Watching,
          },
          {
            name: 'Competing in',
            value: ActivityType.Competing,
          },
        ]
      }
    ]
  },
  access: 'clam',
  callback: async (interaction, args, client, db) => {
    await client.user.setActivity({ name: args.getString('status-text'), type: args.getInteger('status-type') });
    await interaction.reply({ content: 'Set!', ephemeral: true });
  }

}