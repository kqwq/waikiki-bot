import { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle  } from 'discord.js' // Modal class
import fetch from 'node-fetch';


export default {
  slashCommandInfo: {
    name: 'ka-publish',
    type: 1,
    description: 'Publishes a Khan Academy project',
    options: [
      {
        name: 'code',
        type: 11,
        description: 'The code to publish (upload attachment)',
        required: true,
      },
      {
        name: 'title',
        type: 3,
        description: 'The title of the project (default is filename of attachment)',
      },
      {
        name: 'type',
        type: 3,
        description: 'Type of KA project. (defailt is pjs)',
        choices: [
          {
            name: 'PJS',
            value: 'pjs',
            description: 'Processing.js program',
          },
          {
            name: 'Webpage',
            value: 'webpage',
            description: 'HTML webpage',
          },
          {
            name: 'SQL',
            value: 'sql',
            description: 'SQL script (uncommon)',
          },
        ],
      },
      {
        name: 'width',
        type: 4,
        description: 'Canvas width (default is 400)',
      },
      {
        name: 'height',
        type: 4,
        description: 'Canvas height (default is 400)',
      }
    ]
  },
  callback: async (interaction, args, client, db) => {

    const modal = new ModalBuilder() // We create a Modal
      .setCustomId('auth')
      .setTitle('Discord — Khan Academy Authentication');

     const userInput = new TextInputBuilder()
      .setCustomId('auth-usr')
      .setLabel('Username')
      .setStyle(1) // 1 = short
      .setMinLength(2)
      .setMaxLength(128)
      //.setPlaceholder('enter at your own risk')
      .setRequired(true); // If it's required or not
      const passwordInput = new TextInputBuilder()
      .setCustomId('auth-pwd')
      .setLabel('Password')
      .setStyle(1) //IMPORTANT: Text Input Component Style can be 'SHORT' or 'LONG'
      .setMinLength(8)
      .setMaxLength(128)
      //.setPlaceholder('enter at your own risk')
      .setRequired(true); // If it's required or not
      
      const firstActionRow = new ActionRowBuilder().addComponents(userInput);
      const secondActionRow = new ActionRowBuilder().addComponents(passwordInput);
      // const thirdActionRow = new ActionRowBuilder().addComponents
      modal.addComponents(firstActionRow, secondActionRow);


    let att = args.getAttachment('code')
    let res = await fetch(att.attachment)
    let text = await res.text()
    console.log(text.length)

    client.createProgramPayload = {
      title: args.getString('title') || att.name.split('.')[0],
      type: args.getString('type') || (att.name.endsWith('.html') ? 'webpage' : 'pjs'),
      width: args.getInteger('width') || 400,
      height: args.getInteger('height') || 400,
      code: text
    }

    //await interaction.editReply("all good")

    await interaction.showModal(modal); // We show the modal



  }

}