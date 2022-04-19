import { EmbedBuilder } from 'discord.js';

/**
 * Edits the first message of the info channel or sends a new one if it doesn't exist.
 * 
 * @param {number} userId
 * @param {string} [tip="None"] - The tip to show in the #info channel.
 */
const setInfoMessage = async(channel, userId, tip) => {

  // Prepare first message to send
  let content = `**Who** - This is a private *invite-only* server for those who want to share or improve their coding skills
**What** - Applied Coding, the Discord server
**When** - Meeting times TBD
**Why** - This server was created to share coding projects, ask questions and learn new programming concepts quickly. It's a chill space where we don't judge other members based on their skill level.

Most recent tip by <@${userId}>: \`\`\`${tip}\`\`\``
  let embed = new EmbedBuilder()
  embed.setTitle("Server Info")
  embed.setDescription(content)
  embed.setColor("#0099ff")
  embed.setFooter({ text: "Put your own tip here with the /tip command" })
  embed.setTimestamp()

  
  // Get first message in channel, if it exists edit it, otherwise send a new one
  let message = await channel.messages.fetch({ limit: 1 });
  message = message.first();
  if (message && message.embeds.length > 0) { 
    await message.edit({embeds: [embed]});
  } else {
    await channel.send({embeds: [embed]});
  }


  let secondMessageContent = `To provide feedback on another person's project, click "Create Thread" on their message.`
  let secondMessageFile = `https://cdn.discordapp.com/attachments/946894989714157578/946897243678597161/unknown.png`


}


export { setInfoMessage }