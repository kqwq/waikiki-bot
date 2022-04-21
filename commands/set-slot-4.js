import { setSlot } from '../util/codespace.js'

export default {
  slashCommandInfo: {
    name: 'set-slot-4',
    type: 1,
    description: 'Assign slot 4 a trigger',
  },
  callback: async (interaction, args, client, db) => {
    setSlot(interaction, 4, db);
  }
}