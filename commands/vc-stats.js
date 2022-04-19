import { getVoiceStats } from '../util/voice.js'

export default {
  slashCommandInfo: {
    name: 'vc-stats',
    type: 1,
    description: 'Shows VC stats',
  },
  callback: async (interaction, args, client, db) => {
    await getVoiceStats(interaction, client, db);
  }

}