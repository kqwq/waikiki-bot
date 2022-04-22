import { ActionRowBuilder, ButtonBuilder, EmbedBuilder, ButtonStyle } from 'discord.js';
import { promises } from 'fs';
import { setTimeout as wait } from 'timers';


let page = 0;
const linesPerPage = 10;
let collector = null;
let lastInteraction = null;

const getBeeMovieExcerpt = (entireScript, page) => {
  let sub = entireScript.slice(page * linesPerPage, (page + 1) * linesPerPage);
  return sub.join('\n').trim()
   + `\n\n*Page ${page+1} of ${Math.ceil(entireScript.length / linesPerPage)}*`;
}

export default {
  slashCommandInfo: {
    name: 'bee-movie',
    type: 1,
    description: 'Sends the bee movie script',
  },
  callback: async (interaction, args, client, db) => {
    let entireScript = await promises.readFile('./asset/text/bee-movie.txt', 'utf8');
    entireScript = entireScript.split('\n')
    const embed = new EmbedBuilder()
      .setTitle('Bee Movie Script')
      .setDescription(getBeeMovieExcerpt(entireScript, page))
      .setColor('#0099ff');
    const actionRow = new ActionRowBuilder()
      .addComponents(
        
          new ButtonBuilder()
            .setCustomId('back')
            .setLabel('◀')
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId('forward')
            .setLabel('▶')
            .setStyle(ButtonStyle.Primary)
        
      );
      
    const filter = i => i.user.id === interaction.user.id;
    if (collector) {
      await collector.stop();
    }
    collector = interaction.channel.createMessageComponentCollector({ filter, idle: 10_000 });
    collector.on('collect', async i => {
      if (i.customId === 'back') {
        page--;
      } else if (i.customId === 'forward') {
        page++;
      }
      embed.setDescription(getBeeMovieExcerpt(entireScript, page));
      await i.update({ embeds: [embed], components: [actionRow] });
    });
    collector.on('end', () => {
      lastInteraction.editReply({ embeds: [embed], components: [] });
      page = 0;
    });

    
    await interaction.reply({ embeds: [embed], components: [actionRow] });
    lastInteraction = interaction;

  }
}

