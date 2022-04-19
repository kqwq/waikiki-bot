import { ActionRowBuilder, ButtonBuilder, EmbedBuilder, ButtonStyle } from 'discord.js';
import fs from 'fs';
import moment from 'moment';
moment().format();

let maxSessionRecordsPerGuild = 50;
let vcStats = {
  // GUILD_ID_1: {
  //   startedTracking: timessamp,
  //   sessionCount: 1234,
  //   sessionRecords: [
  //     {
  //       guildId: '',
  //       channelId: '',
  //       startTime: timessamp,
  //       duration: ms,
  //       userIdsJoined: [],
  //       maxUserCount: 10,
  //     },
  //     {
  //       ...
  //     }
  //   ]
  // },
  // GUILD_ID_2: {
  //   ...
  // }
}
let activeSessions = [
  // {
  //   guildId: '',
  //   channelId: '',
  //   startTime: '',
  //   userIdsJoined: [],
  //   userIds: [],
  //   maxUserCount: 0,
  // }
]

const vcStatsPath = './storage/vcStats.json'
if (fs.existsSync(vcStatsPath)) {
  vcStats = JSON.parse(fs.readFileSync(vcStatsPath, 'utf8'));
} else {
  fs.writeFileSync(vcStatsPath, JSON.stringify(vcStats));
}

function saveVcStats() {
  fs.writeFileSync(vcStatsPath, JSON.stringify(vcStats, null, 2));
}

const pushNoDuplicates = (arr, item) => {
  if (arr.indexOf(item) === -1) {
    arr.push(item);
  }
}

const handleVoiceStateUpdate = (oldState, newState, client, db) => {
  let guildId = newState.guild.id;
  if (!vcStats[guildId]) {
    vcStats[guildId] = {
      sessionCount: 0,
      sessionRecords: [],
      startedTracking: new Date().getTime()
    }
    saveVcStats();
  }

  // Determine if user joined or left a voice channel
  if (oldState.channelId === null) {
    // User joined a voice channel
    let memberCount = newState.channel.members.size; // Must be 2+ to count as a session
    if (memberCount <= 1) return;

    let session = activeSessions.find(session => session.channelId === newState.channelId);
    if (session) {
      console.log('User joined a voice channel that is already active', newState.member.id)
      // Session exists
      session.userIds = pushNoDuplicates(session.userIds, newState.member.id);
      session.userIdsJoined = pushNoDuplicates(session.userIdsJoined, newState.member.id);
      session.maxUserCount = Math.max(session.maxUserCount, session.userIds.length);
    } else {
      let memberList = newState.channel.members.map(member => member.id);
      session = {
        guildId: newState.guild.id,
        channelId: newState.channelId,
        startTime: new Date().getTime(),
        userIds: memberList,
        userIdsJoined: memberList,
        maxUserCount: 2,
      }
      activeSessions.push(session);
    }
  }

  else if (newState.channelId === null) {
    let session = activeSessions.find(session => session.channelId === oldState.channelId);
    if (session) {
      // Session of 2+ exists
      session.userIds = session.userIds.filter(userId => userId !== oldState.member.id);
      if (session.userIds.length <= 1) {
        // Session is now empty (last person left)
        activeSessions = activeSessions.filter(session => session.channelId !== oldState.channelId);
        session.duration = new Date().getTime() - session.startTime;
        vcStats[guildId].sessionCount++;
        let vsgsr = vcStats[guildId].sessionRecords;
        delete session.userIds;
        vsgsr.push(session);
        vsgsr.sort((a, b) => b.duration - a.duration);
        if (vsgsr.length > maxSessionRecordsPerGuild) {
          vsgsr.pop();
        }
        saveVcStats();
      }
    }
  }
}

const generateEmbed2 = (records, page) => { 
  let recordEntry = records[page]
  let desc2 = `**${page + 1} of ${records.length}**
  ${recordEntry.userIdsJoined.length} members joined ${moment(recordEntry.startTime).calendar()} in the <#${recordEntry.channelId}> channel for ${(recordEntry.duration / 60 / 60 / 1000).toFixed(1)} hours.
  
  Member list:
  ${recordEntry.userIdsJoined.map(userId => `<@${userId}>`).join('\n')}`;
  let embed2 = new EmbedBuilder()
    .setTitle('Longest Sessions List')
    .setColor(0x00FF00)
    .setDescription(desc2)
    .addFields(
      { name: 'Total concurrent', value: recordEntry.maxUserCount.toString(), inline: true },
    )
    .setTimestamp(new Date(recordEntry.startTime));
  return embed2;
}


let page = 0;
let collector = null;
let lastInteraction = null;
const getVoiceStats = async(interaction, client, db) => {
  let guildId = interaction.guild.id;
  if (!vcStats[guildId]) {
    return interaction.reply('No voice stats for this server');
  }
  let startedTracking = moment(vcStats[guildId].startedTracking).calendar();
  let sessionCount = vcStats[guildId].sessionCount;
  let records = [...vcStats[guildId].sessionRecords];
  if (records.length < 1) {
    return interaction.reply('No voice sessions have been recorded for this server.');
  }

  let longestSession = records[0];
  let longestSessionStart = moment(longestSession.startTime).calendar();

  let mostUsersTotalSession = records.sort((a, b) => b.userIdsJoined.length - a.userIdsJoined.length)[0];
  let mostUsersTotalSessionStart = moment(mostUsersTotalSession.startTime).calendar();

  let mostUsersTogetherSession = records.sort((a, b) => b.maxUserCount - a.maxUserCount)[0];
  let mostUsersTogetherSessionStart = moment(mostUsersTogetherSession.startTime).calendar();

  let desc = `Since ${startedTracking}, there have been ${sessionCount} VC sessions in this server.
  
  Longest session: ${(longestSession.duration / 60 / 60 / 1000).toFixed(1)} hours on ${longestSessionStart}

  Most users in an unbroken session, total: ${mostUsersTotalSession.userIdsJoined.length} members on ${mostUsersTotalSessionStart}

  Most users in a session, together: ${mostUsersTogetherSession.maxUserCount} members on ${mostUsersTogetherSessionStart}`;

  let embed1 = new EmbedBuilder()
    .setTitle('Voice Channel Stats')
    .setColor(0x00FF00)
    .setDescription(desc);

  let embed2 = generateEmbed2(records, page);

  const row = new ActionRowBuilder()
    .addComponents(

      new ButtonBuilder()
        .setCustomId('back')
        .setLabel('◀')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('forward')
        .setLabel('▶')
        .setStyle(ButtonStyle.Primary)

    );

  const filter = i => true;
  if (collector) {
    await collector.stop();
  }
  collector = interaction.channel.createMessageComponentCollector({ filter, idle: 15_000 });
  collector.on('collect', async i => {
    if (i.customId === 'back') {
      page--;
    } else if (i.customId === 'forward') {
      page++;
    }
    if (page < 0) {
      page = records.length - 1;
    } else if (page >= records.length) {
      page = 0;
    }
    embed2 = generateEmbed2(records, page);
    await i.update({ embeds: [embed1, embed2], components: [row] });
  });
  collector.on('end', () => {
    lastInteraction.editReply({ embeds: [embed1, embed2], components: [] });
    page = 0;
  });


  lastInteraction = interaction;


  interaction.reply({ embeds: [embed1, embed2], components: [row] });

}

export { handleVoiceStateUpdate, getVoiceStats }