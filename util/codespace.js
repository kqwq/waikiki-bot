import { ModalBuilder, SelectMenuBuilder, SelectMenuOptionBuilder, TextInputBuilder } from '@discordjs/builders';
import { ActionRowBuilder, ButtonStyle, ButtonBuilder, ComponentType, TextInputStyle, ChannelType } from 'discord.js';
import fetch from 'node-fetch';
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
  let clamMembers = await db.get('clamMembers');
  if (clamMembers.includes(user.id)) {
    if (interaction) {
      interaction.reply({ content: `<@${user.id}> already has a codespace` });
    } else {
      let myDashboardChannelId = await db.get('clamMembers', "$.channels[0].id");
      user.send(`Welcome back! Your codespace is already set up in <#${myDashboardChannelId}>.`);
    }
    return;
  } else {
    clamMembers.push(user.id);
    await db.set('clamMembers', clamMembers);
  }


  // Create member data
  let memberObj = {
    id: user.id,
    isMember: true,
    slots: [...Array(4).keys()].map(i => {
      return {
        name: 'Slot ' + (i + 1),
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
  await db.set(`member:${user.id}`, memberObj);



  // Prepare action row
  const row = new ActionRowBuilder() // RGB, gray color oder
    .addComponents(
      new ButtonBuilder()
        .setCustomId('slot1')
        .setLabel('Slot 1')
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId('slot2')
        .setLabel('Slot 2')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId('slot3')
        .setLabel('Slot 3')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('slot4')
        .setLabel('Slot 4')
        .setStyle(ButtonStyle.Secondary)
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
  await db.set(`member:${user.id}`, memberObj);

  if (interaction) {
    interaction.reply(`Created codespace for <@${user.id}>`);
  }
}

const deleteCodespace = async (inGuild, user, db, interaction) => {
  let clamMembers = await db.get('clamMembers');
  if (!clamMembers.includes(user.id)) {
    if (interaction) {
      interaction.reply({ content: `${user.username} doesn't already have a codespace` });
      return
    }
  }
  clamMembers = clamMembers.filter(id => id !== user.id);
  await db.set('clamMembers', clamMembers);
  let memberObj = await db.get(`member:${user.id}`);

  // Delete category and its channels
  let category = await inGuild.channels.cache.find(c => c.name === `${user.username}` && c.type === ChannelType.GuildCategory);
  if (category) {
    console.log(`Deleting category ${category.children}`);
    let channels = await category.children.cache.forEach(async c => {
      await c.delete('bot command');
    })
    await category.delete('bot command')
  }

  if (interaction) {
    await interaction.reply(`Removed <@${user.id}>'s codespace`);
    if (memberObj.slots.find(s => s.trigger !== 'none')) { // If there are any triggers
      let explanation = "Your codespace has been removed! Here is a copy of your data:\n";
      let author = await inGuild.members.fetch(user.id);
      await author.send(explanation + JSON.parse(memberObj, null, 2));
    }
  }

  await db.delete(`member:${user.id}`);
}

const watchSlot = async (channel, user, db) => {

  const filter = i => true
  const collector = channel.createMessageComponentCollector({ filter });
  collector.on('collect', async i => {
    if (i.user.id === user.id) {
      let memberObj = await db.get(`member:${user.id}`);
      let slotInd = parseInt(i.component.customId.slice(4)) - 1;
      console.log(`${i.component.label} was clicked` + slotInd);
      let slot = memberObj.slots[slotInd];
      console.log(slot);
      if (slot.trigger === 'none') {
        await i.reply({ content: `You have not set a trigger for slot ${slotInd} slot yet.`, ephemeral: true });
      } else if (slot.trigger === 'fetch') {
        await i.reply({ content: `Fetching url \`${slot.url}\``, ephemeral: true });
        let fetchOptions = {
          method: slot.method || 'GET',
        }
        if (slot.headers) {
          fetchOptions.headers = slot.headers;
        }
        if (slot.body) {
          fetchOptions.body = slot.body;
        }
        console.log(slot.url, fetchOptions);
        let res = await fetch(slot.url, fetchOptions)
        if (!res.ok) {
          console.log(res)
          await i.followUp({ content: res.statusText, ephemeral: true });
          return
        }
        let text = await res.text();
        let embed = {
          title: `${slot.name} success!`,
          description: text,
          color: 0x00ff00,
        }
        await i.followUp({ embeds: [embed] });
      } else {
        await i.reply({ content: `Unknown trigger type ${slot.trigger}`, ephemeral: true });
      }
    } else {
      await i.reply({ content: `You are not the owner of this channel.`, ephemeral: true });
    }
  })
}

const watchAllExistingCodeSpaces = async (guild, db) => {
  let memberObjs = await db.get('clamMembers');
  for (let memberId of memberObjs) {
    let memberObj = await db.get(`member:${memberId}`);
    let channel = await guild.channels.cache.find(c => c.id === memberObj.channels[0].id);
    if (channel) {
      await watchSlot(channel, { id: memberObj.id }, db);
    }
  }
}


const setSlot = async (interaction, slotInd, db) => {
  let memberObj = await db.get(`member:${interaction.user.id}`);
  const row = new ActionRowBuilder()
    .addComponents(
      new SelectMenuBuilder()
        .setCustomId('trigger-method')
        .addOptions(
          new SelectMenuOptionBuilder()
            .setValue('GET')
            .setLabel('GET')
            .setDescription('Use the GET method to fetch a URL'),
          new SelectMenuOptionBuilder()
            .setValue('POST')
            .setLabel('POST'),
          //.setDescription('Use the POST method'),
          new SelectMenuOptionBuilder()
            .setValue('PUT')
            .setLabel('PUT'),
          //.setDescription('Use the PUT method'),
          new SelectMenuOptionBuilder()
            .setValue('DELETE')
            .setLabel('DELETE'),
          //.setDescription('Use the DELETE method'),
          new SelectMenuOptionBuilder()
            .setValue('PATCH')
            .setLabel('PATCH'),
          //.setDescription('Use the PATCH method')
        )
    )
  //interaction.deferReply();
  let msg = await interaction.reply({ components: [row] })

  const filter = i => i.user.id === interaction.user.id
  const collector = msg.createMessageComponentCollector({ filter, componentType: ComponentType.SelectMenu });
  collector.on('collect', async i => {
    await step2(i)
  });
  collector.on('end', collected => console.log(`Collected ${collected.size} items`));

  const step2 = async (i) => {
    console.log(i.values, 'okk')
    const method = i.values[0]
    const modal = new ModalBuilder()
      .setTitle('URL Request Details')
      .setCustomId(`slot-${slotInd}-${memberObj.id}-${method}`)
      .addComponents(
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId('url')
            .setLabel('Full URL')
            .setPlaceholder('http://example.com')
            .setRequired(true)
            .setStyle(TextInputStyle.Short)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId('headers')
            .setLabel('Headers (optional)')
            .setPlaceholder("headers: {\n  'Content-Type': 'application/json'\n}")
            .setRequired(false)
            .setStyle(TextInputStyle.Paragraph)
        )
      );
    if (['POST', 'PUT', 'PATCH'].includes(i.value)) {
      modal.addComponents(
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId('body')
            .setLabel('Body (POST/PUT/PATCH only)')
            .setPlaceholder('Some payload')
            .setRequired(false)
            .setStyle(TextInputStyle.Paragraph)
        )
      )
    }


    await i.showModal(modal);

  }


}

const registerSlot = async (interaction, db) => {
  let customId = interaction.customId;
  console.log('METHOD IN', customId)
  let [, slotInd, memberId, method] = customId.split('-')
  let reqUrl, reqHeaders, reqBody;
  reqUrl = interaction.fields.getTextInputValue('url')
  reqHeaders = interaction.fields.getTextInputValue('headers')
  try {
    reqBody = interaction.fields.getTextInputValue('body')
  } catch (e) {
    reqBody = ''
  }

  let memberObj = await db.get(`member:${memberId}`);
  let slot = memberObj.slots[slotInd];
  slot.trigger = 'fetch';
  slot.method = method;
  slot.url = reqUrl;
  try {
    slot.headers = JSON.parse(reqHeaders);
  } catch (e) {}
  slot.body = reqBody;
  await db.set(`member:${memberId}`, memberObj);
  await interaction.reply(`Set Slot ${slotInd + 1} for <@${memberObj.id}>`);
}

export { createCodespace, deleteCodespace, setSlot, watchAllExistingCodeSpaces, registerSlot }