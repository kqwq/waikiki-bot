
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import fs from 'fs';
import config from '../config.js';
import dotenv from 'dotenv';
dotenv.config();
const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN);

// Load commands with import
const commands = [];

const loadCommandsFromFile = async() => {
  // console.log("loading commands");
  commands.splice(0, commands.length);
  let commandFiles = await fs.readdirSync('./commands');
  commandFiles = commandFiles.filter(file => file.endsWith('.js'));
  for (const file of commandFiles) {
    // console.log(`Loading command ${file}`);
    const command = await import(`../commands/${file}`);
    commands.push(command.default);
  }
}

const registerLocalSlashCommands = async() => {
  // console.log("number of commands", commands.length);
  const slashCommands = commands.map(c => c.slashCommandInfo)
  await rest.put(
    Routes.applicationGuildCommands(config.CLIENT_ID, config.MAIN_GUILD_ID),
    { body: slashCommands },
  );
}

const registerGlobalSlashCommand = async() => {
  const slashCommands = commands.map(c => c.slashCommandInfo)
  await rest.put(Routes.applicationCommands(client.user.id), { body: slashCommands })
}

const getSlashCommand = (commandName) => {
  const command = commands.find(c => c.slashCommandInfo.name === commandName);
  return command;
}


export { loadCommandsFromFile, registerLocalSlashCommands, registerGlobalSlashCommand, getSlashCommand };