const apiToken = "Not bothering with OAuth dance for this script, just get a legacy token here: https://api.slack.com/legacy/custom-integrations/legacy-tokens";
const commonRequestHeaders = {
   Authorization: `Bearer ${apiToken}`
};

const resources = {
  conversationList: 'conversations.list',
  usersList: 'users.list',
  conversationsHistory: 'conversations.history',
  chatDelete: 'chat.delete'
}

async function getChannels() {
  const pages = await exhaustPagination(resources.conversationList);
  const channels = pages.reduce((channels, nextPage) => channels.concat(nextPage.channels), []);
  return channels;
}

async function getMe(mySlackName){
  const pages = await exhaustPagination(resources.usersList);
  const users = pages.reduce((users, nextPage) => users.concat(nextPage.members), []);
  const matches = users.filter((user) => user.real_name === mySlackName);
  if (matches.length < 1) {
    console.warn(`${mySlackName} was not found.`);
  }
  return matches[0];
}

async function getAllMessages(channelId){
  const pages = await exhaustPagination(resources.conversationsHistory, {channel: channelId});
  const messages = pages.reduce((messages, nextPage) => messages.concat(nextPage.messages), []);
  return messages;
}

async function deleteMessage(channelId, message){
  const url = `https://app.slack.com/api/${resources.chatDelete}?channel=${channelId}&ts=${message.ts}`;
  console.info(`Attempting to delete message: "${message.text}"`);
  const response = await fetch(url, {
    headers: commonRequestHeaders,
    method: 'POST'
  });
  const responseBody = await response.json();
  if (responseBody.ok !== true){
    console.error("Message delete attempted for message:", message);
    console.error(`Received non-"ok" response fetching ${url}`);
    console.error(responseBody);
  }
}

async function exhaustPagination(resource, queryParams){
  const pages = [];
  async function getNextPage(cursor){
    let url = `https://app.slack.com/api/${resource}?limit=999${cursor ? "&cursor=" + cursor : ""}`;
    if (queryParams){
      for (let [key, value] of Object.entries(queryParams)) {
       url = `${url}&${key}=${value}`
      }
    }

    const response = await fetch(url, {
      headers: commonRequestHeaders
    });
    const responseBody = await response.json();
    if (responseBody.ok !== true){
      console.error(`Received non-"ok" response fetching ${url}`);
      console.error(responseBody);
    } else {
      pages.push(responseBody)
      if (responseBody.response_metadata && responseBody.response_metadata.next_cursor !== "") {
        await getNextPage(responseBody.response_metadata.next_cursor);
      }
    }
  }
  await getNextPage();
  console.log(`All pages for ${resource}:`, queryParams)
  console.log(pages);

  return pages;
}

async function fuckMeUpFam(mySlackName){
  const channels = await getChannels();

  // uncomment for a dry run against #test-channel
  // const channels = [{id: "C011DKXANH3", name: "test-channel", is_channel: true, is_group: false, is_im: false}]

  const channelIds = channels.map(c => c.id);
  for (let i = 0; i < channelIds.length; i++) {
    const channelId = channelIds[i];
    const me = await getMe(mySlackName);
    const messages = await getAllMessages(channelId);
    const myMessages = messages.filter(m => m.user === me.id);
    for (let j = 0; j < myMessages.length; j++) {
      await deleteMessage(channelId, myMessages[j]);
    }
  }
}