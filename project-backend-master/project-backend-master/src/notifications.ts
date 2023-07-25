import HTTPError from 'http-errors';
import { getData, setData } from './dataStore';
import { getIdFromMessage, userObjToken, validateToken } from './helper';
import { notifications } from './interfaces';

/**
 * Retrieves the notifications for the user associated with the provided token.
 *
 * @function notificationsGet
 * @param {string} token - The authentication token of the user.
 * @returns {{ notifications: notifications[] }} - An object containing an array of the user's notifications.
 * @throws {HTTPError} - If the token is invalid.
 * @method GET
 */
export function notificationsGet(token: string): { notifications: notifications[] } {
  if (!validateToken(token)) {
    throw HTTPError(403, 'Invalid Token');
  }

  const userObject = userObjToken(token);
  return { notifications: userObject.notifications };
}

/**
 * Adds a notification for each user mentioned in a channel message.
 *
 * @function tagChannelNotification
 * @param {string} message - The message containing user mentions.
 * @param {number} channelId - The ID of the channel where the message is posted.
 * @param {string} token - The authentication token of the user who posted the message.
 */
export function tagChannelNotification(message: string, channelId: number, token: string) {
  const regex = /@\w+/g;
  const handles = message.match(regex);
  const handleArr = handles ? handles.map(handle => handle.slice(1)) : [];
  const handleSet = new Set<string>(handleArr);
  const arr = Array.from(handleSet);

  const tokenHandle = userObjToken(token).handleStr;

  const data = getData();

  const name = data.channels.find(element => element.channelId === channelId).name;

  for (const handle of arr) {
    const channelIndex = data.channels.findIndex(element => element.channelId === channelId);
    const inChannel = data.channels[channelIndex].allMembers.find(element => element.handleStr === handle);

    if (inChannel !== undefined) {
      const userIndex = data.users.findIndex(element => element.handleStr === handle);
      const notif = {
        channelId: channelId,
        dmId: -1,
        notificationMessage: `${tokenHandle} tagged you in ${name}: ${message.slice(0, 20)}`
      };
      data.users[userIndex].notifications.unshift(notif);
      setData(data);
    }
  }
}

/**
 * Adds a notification for each user mentioned in a DM message.
 *
 * @function tagDmNotification
 * @param {string} message - The message containing user mentions.
 * @param {number} dmId - The ID of the DM where the message is posted.
 * @param {string} token - The authentication token of the user who posted the message.
 */
export function tagDmNotification(message: string, dmId: number, token: string) {
  const regex = /@\w+/g;
  const handles = message.match(regex);
  const handleArr = handles ? handles.map(handle => handle.slice(1)) : [];
  const handleSet = new Set<string>(handleArr);
  const arr = Array.from(handleSet);

  const tokenHandle = userObjToken(token).handleStr;

  const data = getData();

  const name = data.dms.find(element => element.dmId === dmId).name;

  for (const handle of arr) {
    const dmIndex = data.dms.findIndex(element => element.dmId === dmId);
    const inDm = data.dms[dmIndex].members.find(element => element.handleStr === handle);

    if (inDm !== undefined) {
      const userIndex = data.users.findIndex(element => element.handleStr === handle);
      const notif = {
        channelId: -1,
        dmId: dmId,
        notificationMessage: `${tokenHandle} tagged you in ${name}: ${message.slice(0, 20)}`
      };
      data.users[userIndex].notifications.unshift(notif);
      setData(data);
    }
  }
}

/**
 * Adds a notification to a user when they are added to a channel or DM.
 *
 * @function addNotification
 * @param {number} uId - The user ID of the user being added.
 * @param {number} channelId - The channel ID the user is being added to (-1 if it's a DM).
 * @param {number} dmId - The DM ID the user is being added to (-1 if it's a channel).
 * @param {string} token - The authentication token of the user who added the user.
 */
export function addNotification(uId: number, channelId: number, dmId: number, token: string) {
  const data = getData();
  const tokenHandle = userObjToken(token).handleStr;

  let name: string;
  if (dmId === -1) {
    name = data.channels.find(element => element.channelId === channelId).name;
  } else {
    name = data.dms.find(element => element.dmId === dmId).name;
  }

  const userIndex = data.users.findIndex(element => element.uId === uId);
  const notif = {
    channelId: channelId,
    dmId: dmId,
    notificationMessage: `${tokenHandle} added you to ${name}`
  };
  data.users[userIndex].notifications.unshift(notif);
  setData(data);
}

/**
 * Adds a notification to a user when someone reacts to their message in a channel or DM.
 *
 * @function reactNotification
 * @param {number} messageId - The ID of the message being reacted to.
 * @param {string} token - The authentication token of the user who reacted to the message.
 */
export function reactNotification(messageId: number, token: string) {
  const tokenHandle = userObjToken(token).handleStr;

  const data = getData();
  const Id = getIdFromMessage(messageId);

  let channelId = -1;
  let dmId = -1;
  let name: string;
  let uId: number;
  let inChannel;
  let inDm;
  if (Id.type === 'channel') {
    channelId = Id.Id;
    name = data.channels.find(element => element.channelId === channelId).name;
    uId = Id.uId;
  } else {
    dmId = Id.Id;
    name = data.dms.find(element => element.dmId === dmId).name;
    uId = Id.uId;
  }

  if (dmId === -1) {
    const channelIndex = data.channels.findIndex(element => element.channelId === channelId);
    inChannel = data.channels[channelIndex].allMembers.find(element => element.uId === uId);
  } else {
    const dmIndex = data.dms.findIndex(element => element.dmId === dmId);
    inDm = data.dms[dmIndex].members.find(element => element.uId === uId);
  }

  if (inChannel !== undefined || inDm !== undefined) {
    const userIndex = data.users.findIndex(element => element.uId === uId);
    const notif = {
      channelId: channelId,
      dmId: dmId,
      notificationMessage: `${tokenHandle} reacted to your message in ${name}`
    };
    data.users[userIndex].notifications.unshift(notif);
    setData(data);
  }
}
