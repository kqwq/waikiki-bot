import { setSlot } from '../util/codespace.js'

export default {
  slashCommandInfo: {
    name: 'set-slot-1',
    type: 1,
    description: 'Assign slot 1 a trigger',
  },
  access: 'clam',
  callback: async (interaction, args, client, db) => {
    setSlot(interaction, 0, db);
  }
}