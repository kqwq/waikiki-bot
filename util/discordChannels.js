import { ChannelType, Client, PermissionFlagsBits, PermissionOverwrites } from 'discord.js';

const createChannel = async (user, guild, parentCategory, name, templateType) => {

  let channel
  if (templateType === 'public') {
    
 
    channel = await guild.channels.create(name, { type: ChannelType.GuildText, parent: parentCategory })
  } else if (templateType === 'private') {
    channel = await guild.channels.create(`projects`, { type: ChannelType.GuildText, parent: parentCategory,
        permissionOverwrites: [{
        id: guild.roles.everyone,
        deny: [ PermissionFlagsBits.SendMessages ],
      },
      {
        id: user.id,
        allow: [ PermissionFlagsBits.SendMessages ],
      }]
    })
  } else if (templateType === 'hidden') {
    channel = await guild.channels.create(name, { type: ChannelType.GuildText, parent: parentCategory,
        permissionOverwrites: [{
        id: guild.roles.everyone,
        deny: [ PermissionFlagsBits.ViewChannel ],
      },
      {
        id: user.id,
        allow: [ PermissionFlagsBits.ViewChannel ],
      }]
    })
  } else if (templateType === 'voice') {
    channel = await guild.channels.create(name, { type: ChannelType.GuildVoice, parent: parentCategory })
  }
  return channel;

}

const createCategory = async (guild, name) => {
  let category = await guild.channels.create(name, { type: ChannelType.GuildCategory })
  return category;
}


export { createChannel, createCategory }