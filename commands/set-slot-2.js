import { setSlot } from '../util/codespace.js'

export default {
  slashCommandInfo: {
    name: 'set-slot-2',
    type: 1,
    description: 'Assign slot 2 a trigger',
  },
  access: 'clam',
  callback: async (interaction, args, client, db) => {
    setSlot(interaction, 1, db);
  }
}