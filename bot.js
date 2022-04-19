import { Client, GatewayIntentBits, Partials, EmbedBuilder } from 'discord.js';
import config from './config.js';
import fs from 'fs';
import { createCodespace } from './util/codespace.js';
import { loadCommandsFromFile, registerLocalSlashCommands, registerGlobalSlashCommand, getSlashCommand } from './util/slashCommands.js';
import dotenv from 'dotenv';
import { publishProgram } from './util/ka_utils.js'; 
import { handleVoiceStateUpdate } from './util/voice.js';
import { setTimeout as sleep } from 'timers';
dotenv.config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, 
    GatewayIntentBits.DirectMessages, 
  GatewayIntentBits.GuildVoiceStates],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});


// Load sqlite3 database, create if it doesn't exist
const db = {}




client.on('ready', async () => {
  console.log(`Logged in as ${client.user.tag}!`);
  ;

  client.mainGuild = client.guilds.cache.get(config.MAIN_GUILD_ID);
  client.infoChannel = client.mainGuild.channels.cache.find(channel => channel.name === 'info');

  // slash commands
  await loadCommandsFromFile();
  await registerLocalSlashCommands();
  //await registerGlobalSlashCommand();
});

client.on('interactionCreate', async interaction => {
  if (interaction.isModalSubmit()) {
    if (interaction.customId === 'auth') {
      publishProgram(interaction, client)
    }
  }else if (interaction.isCommand()) {

    const command = getSlashCommand(interaction.commandName);
    const args = interaction.options

    await command.callback(interaction, args, client, db).catch(e => {
      console.error(e);
      let embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('An error occurred')
        .setDescription(e.message.slice(0, 2000))
        .addFields(
          { name: 'Command', value: interaction.commandName, inline: true },
          { name: 'User', value: `<@${interaction.user.id}>`, inline: true }
        )
        .setTimestamp();
      interaction.reply({ embeds: [embed] });
    });
  }
});

// On modal submit
client.on('messageCreate', async message => {
  if (message.author.bot) {
    return;
  } else {
    if (message.channel.id === client.infoChannel.id) {
      await message.delete()
      await message.author.send(`Psst! You're not supposed to send messages in <#${message.channel.id}>`);
    }
  }

});

// On member join, add them to the database
client.on('guildMemberAdd', async member => {
  console.log(`${member.user.username} has joined ${member.guild.name}`);
  await createCodespace(member.guild, member.user, db);
})

client.on('voiceStateUpdate', async (oldState, newState) => {
  handleVoiceStateUpdate(oldState, newState, client, db);
})





client.login(process.env.DISCORD_TOKEN);