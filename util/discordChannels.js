import { Client } from 'discord.js';

const createChannel = async (guild, parentCategory, name, templateType) => {

  let channel
  if (templateType === 'public') {
    channel = await guild.channels.create(name, { type: 'GUILD_TEXT', parent: parentCategory })
  } else if (templateType === 'private') {
    channel = await guild.channels.create(`projects`, { type: 'GUILD_TEXT', parent: parentCategory,
        permissionOverwrites: [{
        id: inGuild.roles.everyone,
        deny: ['SEND_MESSAGES'],
      },
      {
        id: user.id,
        allow: ['SEND_MESSAGES'],
      }]
    })
  } else if (templateType === 'hidden') {
    channel = await guild.channels.create(name, { type: 'GUILD_TEXT', parent: parentCategory,
        permissionOverwrites: [{
        id: inGuild.roles.everyone,
        deny: ['READ_MESSAGES'],
      },
      {
        id: user.id,
        allow: ['READ_MESSAGES'],
      }]
    })
  } else if (templateType === 'voice') {
    channel = await guild.channels.create(name, { type: 'GUILD_VOICE', parent: parentCategory })
  }
  return channel;

}

const createCategory = async (guild, name) => {
  let category = await guild.channels.create(name, { type: 'GUILD_CATEGORY' })
  return category;
}


export { createChannel, createCategory }