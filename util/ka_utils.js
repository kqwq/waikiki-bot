import fetch from 'node-fetch';
import { ActionRowBuilder, ButtonBuilder, EmbedBuilder, ButtonStyle } from 'discord.js';


let baseUrl = "https://www.khanacademy.org/api/internal";
async function login(username, password) {
  let res = await fetch(`${baseUrl}/graphql/loginWithPasswordMutation`, {
    "credentials": "include",
    "headers": {
      "content-type": "application/json",
      "x-ka-fkey": "lol",
      "cookie": "fkey=lol"
    },
    "body": `{\"operationName\":\"loginWithPasswordMutation\",\"variables\":{\"identifier\":\"${username}\",\"password\":\"${password}\"},\"query\":\"mutation loginWithPasswordMutation($identifier: String!, $password: String!) {\\n  loginWithPassword(identifier: $identifier, password: $password) {\\n    user {\\n      id\\n      kaid\\n      canAccessDistrictsHomepage\\n      isTeacher\\n      hasUnresolvedInvitations\\n      transferAuthToken\\n      preferredKaLocale {\\n        id\\n        kaLocale\\n        status\\n        __typename\\n      }\\n      __typename\\n    }\\n    isFirstLogin\\n    error {\\n      code\\n      __typename\\n    }\\n    __typename\\n  }\\n}\\n\"}`,
    "method": "POST",
    "mode": "cors"
  })
  let data = await res.headers.get("set-cookie")
  let kaas = (data.match(/KAAS=([\w-]+)/) || [])[1]
  return kaas
}

const withHeader = (kaas) => {
  return {
    "content-type": "application/json",
    "x-ka-fkey": `lol`,
    "cookie": `KAAS=${kaas}; fkey=lol`
  }
};

// { "title": "bbbbb", 
// "translatedTitle": "bbbbb", 
// "category": null, 
// "difficulty": null, 
// "tags": [], 
// "userAuthoredContentType": "pjs", 
// "topicId": 
// "xffde7c31", 
// "revision": 
// { "code": "asdfsdaf", 
// "editor_type": 
// "ace_pjs", "
// folds": [], 
// "image_url": "data:image/png;base64,/+/==", "config_version": 4, "topic_slug": "computer-programming" } }

async function createProgram(
  kaas,
  code,
  title = "New Program",
  width = 400,
  height = 400,
  type = "pjs",
  base64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQYV2NgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII=",
) {
  let res = await fetch(`${baseUrl}/scratchpads`, {
    "headers": withHeader(kaas),
    "body": JSON.stringify({
      userAuthoredContentType: type,
      title,
      // width,
      // height,
      revision: {
        code: code,
        folds: [],
        image_url: `${base64}`,
      },
    }),
    "method": "POST",
  })
  // Return error if there is one
  return res;
}

async function updateProgram(kaas, id, code, title = "New program", width = 600, height = 600, base64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQYV2NgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII=") {
  let body = {
    width,
    height,
    title: title,
    revision: {
      code: code,
      image_url: base64,
      folds: []
    }
  }
  let res = await fetch(`${baseUrl}/scratchpads/${id}`, {
    "headers": withHeader(kaas),
    "body": JSON.stringify(body),
    "method": "PUT",
  })
  // Return error if there is one
  return res;
}

async function getProgram(id) {
  let res = await fetch(`${baseUrl}/scratchpads/${id}`)
  let data = await res.json()
  return data
}

/**
 * 
 * @param {string} originId 
 * @param {int} sort (default) 2: Newest to oldest, 1: Highest voted to lowest
 * @param {int} limit (default) 10
 */
async function getSpinoffs(originId, sort = 2, limit = 4) {
  let res = await fetch(`${baseUrl}/scratchpads/Scratchpad:${originId}/top-forks?sort=${sort}&limit=${limit}`)
  let data = await res.json()
  return data
}

const publishProgram = async (interaction, client) => {
  let modal = interaction.fields;
  await interaction.reply({ content: "Publishing...", ephemeral: true })
  const username = modal.getTextInputValue('auth-usr')
  const password = modal.getTextInputValue('auth-pwd')

  let kaas = await login(username, password)
  let payload = client.createProgramPayload
  console.log(username, password,kaas)
  if (!payload?.code) {
    interaction.reply({ content: "No program to publish", ephemeral: true })
    return
  }
  let res = await createProgram(kaas, payload.code, payload.title, payload.width, payload.height, payload.type)
  if (!res.ok) {
    interaction.reply({ content: res.error })
    return
  }
  let data = await res.json()
  let desc = `
  **${data.title}**

  ${data.revision.code.slice(0, 100) + '...'}

  [Program link](${data.url})
  `;
  client.createProgramPayload = {}
  await interaction.followUp({
    embeds: [
      new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle('Success!')
        .setDescription(desc)
    ]
  })

  // Change width/height
  if (payload.width !== 400 || payload.height !== 400) {
    let res = await updateProgram(kaas, data.id,payload.code, payload.title, payload.width, payload.height)
    if (!res.ok) {
      interaction.reply({ content: res.error })
      return
    }
    data = await res.json()
    await interaction.followUp({
      embeds: [
        new EmbedBuilder()
          .setColor('#aaff00')
          .setTitle('Successfully edited width/height.')
          .setDescription(`
          Width: ${data.width}
          Height: ${data.height}
          `)
      ]
    })
  }

}

export { login, createProgram, updateProgram, publishProgram }