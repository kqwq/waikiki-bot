import { SelectMenuBuilder, SelectMenuOptionBuilder } from '@discordjs/builders';
import { ActionRowBuilder, ButtonStyle, ButtonBuilder } from 'discord.js';
import fs from 'fs';
import { createChannel, createCategory } from './discordChannels.js';



const createCodespace = async (inGuild, user, db, interaction) => {
  // let query = `INSERT INTO users (id, username, discriminator, avatar) VALUES (${user.id}, "${user.username}", ${user.discriminator}, "${user.avatarURL()}")`;
  // db.run(query, (err) => {
  //   if (err) {
  //     return console.error(err.message);
  //   }
  //   console.log(`User ${user.username}#${user.discriminator} (${user.id}) added to the database.`);
  // });

  // Add member to clamMembers in redis db
  let clamMembers = await db.json.get('clamMembers');
  if (clamMembers.includes(user.id)) {
    if (interaction) {
      interaction.reply({ content: `${user.username} is already a member` });
    } else {
      let myDashboardChannelId = await db.json.get('clamMembers', "$.channels[0].id");
      user.send(`Welcome back! Your codespace is already set up in <#${myDashboardChannelId}>.`);
    }
    return;
  } else {
    clamMembers.push(user.id);
    await db.json.set('clamMembers', '.', clamMembers);
  }


  // Create member data
  let memberObj = {
    id: user.id,
    isMember: true,
    slots: [...Array(4).keys()].map(i => {
      return {
        name: 'Slot ' + i,
        trigger: 'none',
        url: '',
        params: []
      }
    }),
    categoryName: user.username,
    channels: [
      {
        isDashboard: true,
        name: 'dashboard',
        type: 'hidden',
        description: '',
      },
      {
        name: 'projects',
        type: 'private',
        description: '',

      }
    ]
  }

  // Write member JSON data to redis db
  await db.json.set(`member:${user.id}`, '.', memberObj);



  // Prepare action row
  const row = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('slot0')
        .setLabel('Slot 0')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('slot1')
        .setLabel('Slot 1')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('slot2')
        .setLabel('Slot 2')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId('slot3')
        .setLabel('Slot 3')
        .setStyle(ButtonStyle.Danger)
    );

  // Set up category with channels
  const category = await createCategory(inGuild, user.username);
  for (let channelData of memberObj.channels) {
    const channel = await createChannel(user, inGuild, category, channelData.name, channelData.type);
    channelData.id = channel.id;

    if (channelData.isDashboard) {
      await channel.send(`<@${user.id}>`);
      await channel.send({
        embeds: [{
          title: `${user.username}'s Dashboard`,
          description: 'This is the dashboard for your codespace. More info coming soon!',
          color: 0xd4a20f,
        }],
        components: [row]
      });
      await watchSlot(channel, user, db);
    }
  }

  // Save channel data to redis db
  await db.json.set(`member:${user.id}`, '$.channels', memberObj.channels);

  if (interaction) {
    interaction.reply(`Created codespace for <@${user.id}>`);
  }
}

const deleteShowcase = async (inGuild, user, db, interaction) => {
  let query = `DELETE FROM users WHERE id = ${user.id}`;
  db.run(query, (err) => {
    if (err) {
      return console.error(err.message);
    }
    console.log(`User ${user.username}#${user.discriminator} (${user.id}) removed from the database.`);
  });

  // Delete metadata file
  if (fs.existsSync(`./storage/user/${user.id}.json`)) {
    await fs.promises.unlink(`./storage/user/${user.id}.json`);
  }

  // Delete category and its channels
  let category = await inGuild.channels.cache.find(c => c.name === `${user.username}` && c.type === 'GUILD_CATEGORY');
  if (category) {
    let channels = await category.children.forEach(async c => {
      await c.delete('bot command');
    })
    await category.delete('bot command')
  }

  if (interaction) {
    interaction.reply(`Removed category and all its channels for ${user.username}#${user.discriminator} (${user.id})`);
  }
}

const watchSlot = async (channel, user, db) => {
  let memberObj = await db.json.get(`member:${user.id}`);

  const filter = i => true
  const collector = channel.createMessageComponentCollector({ filter });
  collector.on('collect', async i => {
    if (i.user.id === user.id) {
      let slotInd = parseInt(i.component.customId.slice(4));
      console.log(`${i.component.label} was clicked` + slotInd);
      await i.reply(`${i.component.label} was clicked`);
      let slot = memberObj.slots[slotInd];
      if (slot.trigger === 'none') {
        await i.reply({ content: `You have not set a trigger for this slot yet.`, ephemeral: true });
      } else if (slot.trigger === 'fetch') {
        await i.reply({ content: `Fetching url \`${slot.url}\``, ephemeral: true });
        let res = await fetch(slot.url);
        if (!res.ok) {
          await i.followUp({ content: res.statusText, ephemeral: true });
          return
        }
        let text = await res.text();
        let embed = {
          title: `${slot.name} success!`,
          description: text,
          color: 0x00ff00,
        }
        await i.followUp({ embed });
      } else {
        await i.reply({ content: `Unknown trigger type ${slot.trigger}`, ephemeral: true });
      }
    } else {
      await i.reply({ content: `You are not the owner of this channel.`, ephemeral: true });
    }
  })
}


const setSlot = async (interaction, slotInd, db) => {
  let memberObj = await db.json.get(`member:${interaction.user.id}`);
  const row = new ActionRowBuilder()
    .addComponents(
      new SelectMenuBuilder()
        .setCustomId('trigger-method')
        .addOptions(
          new SelectMenuOptionBuilder()
            .setValue('GET')
            .setLabel('GET')
            .setDescription('Use the GET method to fetch a url'),
          new SelectMenuOptionBuilder()
            .setValue('POST')
            .setLabel('POST')
            .setDescription('Use the POST method to fetch a url'),
          new SelectMenuOptionBuilder()
            .setValue('PUT')
            .setLabel('PUT')
            .setDescription('Use the PUT method to fetch a url'),
          new SelectMenuOptionBuilder()
            .setValue('DELETE')
            .setLabel('DELETE')
            .setDescription('Use the DELETE method to fetch a url'),
          new SelectMenuOptionBuilder()
            .setValue('PATCH')
            .setLabel('PATCH')
            .setDescription('Use the PATCH method to fetch a url')
        )
    )
  await interaction.reply({ components: [row] })
  


}


export { createCodespace, deleteShowcase }