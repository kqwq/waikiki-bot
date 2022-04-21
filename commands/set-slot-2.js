import { setSlot } from '../util/codespace.js'

export default {
  slashCommandInfo: {
    name: 'set-slot-2',
    type: 1,
    description: 'Assign slot 2 a trigger',
  },
  callback: async (interaction, args, client, db) => {
    setSlot(interaction, 2, db);
  }
}