import { setSlot } from '../util/codespace.js'

export default {
  slashCommandInfo: {
    name: 'set-slot-3',
    type: 1,
    description: 'Assign slot 3 a trigger',
  },
  access: 'clam',
  callback: async (interaction, args, client, db) => {
    setSlot(interaction, 2, db);
  }
}