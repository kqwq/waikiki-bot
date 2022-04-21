import { setSlot } from '../util/codespace.js'

export default {
  slashCommandInfo: {
    name: 'set-slot-3',
    type: 1,
    description: 'Assign slot 3 a trigger',
  },
  callback: async (interaction, args, client, db) => {
    setSlot(interaction, 3, db);
  }
}