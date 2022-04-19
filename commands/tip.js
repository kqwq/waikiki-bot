import { setInfoMessage } from '../util/infoChannel.js';

export default {
  slashCommandInfo: {
    name: 'tip',
    type: 1,
    description: 'Sends a tip in the info channel.',
    options: [
      {
        name: 'message',
        type: 3,
        description: 'The message to put',
        required: true
      }
    ]
  },
  permission: 'clam',
  callback: async (interaction, args, client, db) => {
    await setInfoMessage(client.infoChannel, interaction.user.id, args.getString('message'));
    await interaction.reply({ content: 'Sent!', ephemeral: true });
  }

}