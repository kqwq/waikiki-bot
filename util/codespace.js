import { ButtonStyle } from 'discord.js';
import fs from 'fs';
import { createChannel, createCategory } from './discordChannels.js';

const createCodespace = async (inGuild, user, db, interaction) => {
  let query = `INSERT INTO users (id, username, discriminator, avatar) VALUES (${user.id}, "${user.username}", ${user.discriminator}, "${user.avatarURL()}")`;
  db.run(query, (err) => {
    if (err) {
      return console.error(err.message);
    }
    console.log(`User ${user.username}#${user.discriminator} (${user.id}) added to the database.`);
  });

  // Create metadata file
  let memberObj = {
    id: user.id,
    isMember: true,
  }
  await fs.promises.writeFile(`./storage/user/${user.id}.json`, JSON.stringify(memberObj))

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
  let category = await createCategory(inGuild, user.username);
  let dashboardChannel = await createChannel(inGuild, category, 'dashboard', 'hidden');
  await createChannel(inGuild, category, 'projects', 'private');
  await dashboardChannel.send(`<@${user.id}>`);
  await dashboardChannel.send({
    embeds: [{
      title: `${user.nickname}'s Dashboard`,
      description: 'This is the dashboard for your category. Only you can see this channel. Use this widget to create new sub-channels or delete existing ones.',
      color: 0xd4a20f,
    }],
    components: [row]
  });



  if (interaction) {
    interaction.reply(`Created category for ${user.username}#${user.discriminator} (${user.id})`);
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


export { createCodespace, deleteShowcase }