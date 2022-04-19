import { loadCommandsFromFile, registerLocalSlashCommands, registerGlobalSlashCommand } from '../util/slashCommands.js';

export default {
  slashCommandInfo: {
    name: 'sl',
    type: 1,
    description: 'Updates slash commands',
    options: [
      {
        name: 'scope',
        description: 'The scope of the slash command',
        type: 3,
        choices: [
          {
            name: 'global',
            value: 'global',
            description: 'Global slash commands',
          },
          {
            name: 'local',
            value: 'local',
            description: 'Local slash commands for main guild',
          },
        ],
      }
    ]
  },
  permission: 'admin',
  callback: async (interaction, args, client, db) => {
    
    await interaction.deferReply();
    await loadCommandsFromFile();
    if (args.getString('scope') === 'global') {
      await registerGlobalSlashCommand();
      await interaction.editReply('Global slash commands updated');
    } else {
      await registerLocalSlashCommands();
      await interaction.editReply('Local commands updated');
    }
  }

}