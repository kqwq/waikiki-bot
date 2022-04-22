import { setSlot } from '../util/codespace.js'

export default {
  slashCommandInfo: {
    name: 'set-slot-4',
    type: 1,
    description: 'Assign slot 4 a trigger',
  },
  access: 'clam',
  callback: async (interaction, args, client, db) => {
    setSlot(interaction, 3, db);
  }
}