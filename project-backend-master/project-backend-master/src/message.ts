import { getData, setData } from './dataStore';
import { validateToken, isMessageInChannel, findChannelIndexWithMessage, getUIdFromToken, isOwnerByToken, isMember, isMessageInDM, findDMIndexWithMessage, isDmMember } from './helper';
import { isDmIdValid, createMessageId, isChannelIdValid, isGlobalOwnerFromToken1, getDm, isOwner, isGlobalOwnerFromUid } from './helper';
import { dataTs, channel, dms, error, messageId, messages } from './interfaces';
import { tagChannelNotification, tagDmNotification, reactNotification } from './notifications';
import HTTPError from 'http-errors';

/**
 *
 * @param {string} token - Unique token of a user
 * @param {number} dmId - Unique Id of the Dm to send a message to
 * @param {string} message - The message string
 * @param {number} timeSent - Desired time to be sent
 * @returns {error: 'string'} - Error Message - Error message describing the error cause
 * @returns {messageId: number} - The unique messageId that gets created upon creating a new message
 * @method POST
 * @summary
 * When given a valid token, dmId, message, timeSent. If the member is a part of the Dm.
 * The desired message will be sent at a later time. If this action was successful then
 * the function will return a messageId, if it was unsuccessful it will return an error.
 */
export function messageSendLaterDmV1(token: string, dmId: number, message: string, timeSent: number): error | messageId {
  const data: dataTs = getData();

  // dmId does not refer to a valid DM
  if (!isDmIdValid(dmId)) {
    throw HTTPError(400, 'Invalid dmId');
  }

  // length of message is less than 1 or over 100 characters
  if (!(message.length >= 1 && message.length <= 1000)) {
    throw HTTPError(400, 'message must be between 1 to 1000 letters');
  }

  // invalid token
  if (!validateToken(token)) {
    throw HTTPError(403, 'Invalid token');
  }

  // dmId is valid and the authorised user is not a member of the DM they are trying to post to
  if (!isDmMember(dmId, token)) {
    throw HTTPError(403, 'user is not a mmeber of the DM');
  }

  // timeSent is a time in the past
  if (timeSent * 1000 < new Date().getTime()) {
    throw HTTPError(400, 'timeSent is a time in the past');
  }

  // stay in this loop until the delay has been met
  for (; ;) {
    if (new Date().getTime() >= timeSent * 1000) {
      break;
    }
  }

  // prepare to make a new message
  const messageId = createMessageId();
  const uId = getUIdFromToken(token) as number;
  const dmIndex: number = data.dms.findIndex(dm => dm.dmId === dmId);

  // post message
  data.dms[dmIndex].messages.push({
    messageId: messageId,
    uId: uId,
    message: message,
    timeSent: ~~(new Date().getTime() / 1000),
    reacts: [{
      reactId: 1,
      uIds: []
    }],
    isPinned: false
  });

  setData(data);

  // notification
  tagDmNotification(message, dmId, token);

  return { messageId: messageId };
}

/**
 *
 * @param {string} token - Unique token of a user
 * @param {number} channelId - Unique Id of the channel to send a message to
 * @param {string} message - The message string
 * @param {number} timeSent - Desired time to be sent
 * @returns {error: 'string'} - Error Message - Error message describing the error cause
 * @returns {messageId: number} - The unique messageId that gets created upon creating a new message
 * @method POST
 * @summary
 * When given a valid token, channelId, message, timeSent. If the member is a part of the channel.
 * The desired message will be sent at a later time. If this action was successful then
 * the function will return a messageId, if it was unsuccessful it will return an error.
 */
export function messageSendLaterV1(token: string, channelId: number, message: string, timeSent: number): error | messageId {
  const data: dataTs = getData();

  // channelId does not refer to a valid channel
  if (!isChannelIdValid(channelId)) {
    throw HTTPError(400, 'Invalid channelId');
  }

  // length of message is less than 1 or over 1000 characters
  if (!(message.length >= 1 && message.length <= 1000)) {
    throw HTTPError(400, 'message must be between 1 to 1000 letters');
  }

  // Invalid token
  if (!validateToken(token)) {
    throw HTTPError(403, 'Invalid token');
  }

  // channelId is valid and the authorised user is not a member of the channel they are trying to post to
  const uId = getUIdFromToken(token) as number;
  if (!isMember(channelId, uId)) {
    throw HTTPError(403, 'user is not member of channel');
  }

  // timeSent is a time in the past
  if (timeSent * 1000 < new Date().getTime()) {
    throw HTTPError(400, 'timeSent is a time in the past');
  }

  // stay in this loop until the delay has been met
  for (; ;) {
    if (new Date().getTime() >= timeSent * 1000) {
      break;
    }
  }

  // prepare to create a new message
  const messageId = createMessageId();
  const channelIndex: number = data.channels.findIndex(channel => channel.channelId === channelId);

  // post the message
  data.channels[channelIndex].messages.push({
    messageId: messageId,
    uId: uId,
    message: message,
    timeSent: ~~(new Date().getTime() / 1000),
    reacts: [{
      reactId: 1,
      uIds: []
    }],
    isPinned: false
  });

  setData(data);

  // notification
  tagChannelNotification(message, channelId, token);

  return { messageId: messageId };
}

/**
 *
 * @param token
 * @param messageId
 * @param message
 * @returns {}
 * @method PUT
 * @summary
 * Given a message with ID messageId, updates its text with new text given in
 * message. If the new message is an empty string, the message is deleted.
 * NEW IN ITERATION 3: If a shared/standup message is edited, the entire
 * contents will be edited as if it was a normal message.
 */
export function messageEditV2(token: string, messageId: number, message: string) {
  const data: dataTs = getData();
  if (message.length > 1000) {
    throw HTTPError(400, 'Messages must be longer than 1000 characters');
  }

  if (!validateToken(token)) {
    throw HTTPError(403, 'Invalid token');
  }

  if (isMessageInChannel(messageId)) {
    const channelIndex: number = findChannelIndexWithMessage(messageId);
    const channel: channel = data.channels[channelIndex];
    const currentMessage = channel.messages.find(message => message.messageId === messageId);
    const authUserId: number = getUIdFromToken(token) as number;
    if (!isMember(channel.channelId, authUserId)) {
      throw HTTPError(403, 'This user is not a member of this channel');
    }

    if (!isOwnerByToken(channel.channelId, token) && currentMessage.uId !== authUserId && !isGlobalOwnerFromToken1(token)) {
      throw HTTPError(403, 'User does not have correct permissions');
    }

    if (message.length === 0) {
      data.channels[channelIndex].messages = data.channels[channelIndex].messages.filter(message => message.messageId !== messageId);
    } else {
      const messageIndex: number = channel.messages.findIndex(message => message.messageId === messageId);
      data.channels[channelIndex].messages[messageIndex].message = message;
    }
    setData(data);
    tagChannelNotification(message, channel.channelId, token);
    return {};
  } else if (isMessageInDM(messageId)) {
    const dmIndex: number = findDMIndexWithMessage(messageId);
    const dm: dms = data.dms[dmIndex];
    const currentMessage = dm.messages.find(message => message.messageId === messageId);
    const authUserId: number = getUIdFromToken(token) as number;

    if (dm.creator.uId !== authUserId && currentMessage.uId !== authUserId) {
      throw HTTPError(403, 'User does not have correct permissions');
    }

    if (dm.creator.uId !== authUserId && !isDmMember(dm.dmId, token)) {
      throw HTTPError(403, 'This user is not a member of this DM');
    }

    if (message.length === 0) {
      data.dms[dmIndex].messages = data.dms[dmIndex].messages.filter(message => message.messageId !== messageId);
    } else {
      const messageIndex: number = dm.messages.findIndex(message => message.messageId === messageId);
      data.dms[dmIndex].messages[messageIndex].message = message;
    }
    setData(data);
    tagDmNotification(message, dm.dmId, token);
    return {};
  }

  throw HTTPError(400, 'Invalid messageId');
}

/**
 *
 * @param token
 * @param messageId
 * @returns {}
 * @method DELETE
 * @summary
 * Given a messageId for a message, removes the message from the channel/DM
 */
export function messageRemoveV2(token: string, messageId: number) {
  return messageEditV2(token, messageId, '');
}

/**
 * @param token
 * @param dmId
 * @param message
 * @returns { messageId }
 * @method POST
 * @summary
 * Sends a message from authorised user to the DM specified by dmId.
 * Note: Each message should have its own unique ID, i.e. no messages
 * should share an ID with another message, even if that other message
 * is in a different channel or DM.
 */
export const messageSenddmV2 = (token: string, dmId: number, message: string) => {
  const data: dataTs = getData();

  if (!isDmIdValid(dmId)) {
    throw HTTPError(400, 'Invalid dmId');
  }
  if (!(message.length >= 1 && message.length <= 1000)) {
    throw HTTPError(400, 'message must be between 1 to 1000 letters');
  }
  if (!validateToken(token)) {
    throw HTTPError(400, 'Invalid token');
  }
  if (!isDmMember(dmId, token)) {
    throw HTTPError(403, 'user is not member of channel');
  }
  const messageId = createMessageId();
  const uId = getUIdFromToken(token) as number;
  const dmIndex: number = data.dms.findIndex(dm => dm.dmId === dmId);
  data.dms[dmIndex].messages.push({
    messageId: messageId,
    uId: uId,
    message: message,
    timeSent: ~~(new Date().getTime() / 1000),
    reacts: [{
      reactId: 1,
      uIds: []
    }],
    isPinned: false
  });
  setData(data);
  tagDmNotification(message, dmId, token);
  return { messageId: messageId };
};

/**
 * @param token
 * @param channelId
 * @param message
 * @returns { messageId }
 * @method POST
 * @summary
 *  Sends a message from the authorised user to the channel specified by channelId.
 *  Note: Each message should have its own unique ID, i.e. no messages should share an ID
 *  with another message, even if that other message is in a different channel or DM.
 */

export const messageSendV2 = (token: string, channelId: number, message: string) => {
  const data: dataTs = getData();

  if (!isChannelIdValid(channelId)) {
    throw HTTPError(400, 'Invalid channelId');
  }
  if (!(message.length >= 1 && message.length <= 1000)) {
    throw HTTPError(400, 'message must be between 1 to 1000 letters');
  }
  if (!validateToken(token)) {
    throw HTTPError(400, 'Invalid token');
  }
  const uId = getUIdFromToken(token) as number;
  if (!isMember(channelId, uId)) {
    throw HTTPError(403, 'user is not member of channel');
  }
  const messageId = createMessageId();
  const channelIndex: number = data.channels.findIndex(channel => channel.channelId === channelId);
  data.channels[channelIndex].messages.push({
    messageId: messageId,
    uId: uId,
    message: message,
    timeSent: ~~(new Date().getTime() / 1000),
    reacts: [{
      reactId: 1,
      uIds: []
    }],
    isPinned: false
  });
  setData(data);

  tagChannelNotification(message, channelId, token);
  return { messageId: messageId };
};

const getChannelFromMessageId = (messageId: number): channel => {
  const data: dataTs = getData();
  return data.channels.find(channel => channel.messages.find(message => message.messageId === messageId));
};

const getDmFromMessageId = (messageId: number): dms => {
  const data: dataTs = getData();
  return data.dms.find(dm => dm.messages.find(message => message.messageId === messageId));
};
const isDmOwner = (dmId: number, uId: number): boolean => {
  const dms: dms = getDm(dmId) as dms;
  return dms.creator.uId === uId;
};

export const getMessage = (messageId: number): messages | boolean => {
  const data: dataTs = getData();
  let msg;
  for (const channel of data.channels) {
    msg = channel.messages.find(message => message.messageId === messageId);
    if (msg) {
      return msg;
    }
  }
  for (const dm of data.dms) {
    msg = dm.messages.find(message => message.messageId === messageId);
    if (msg) {
      return msg;
    }
  }
  return false;
};

/**
 *
 * @param token
 * @param messageId
 * @returns none
 * @method POST
 * @summary
 * Given a message within a channel or DM, marks it as "pinned".
 */
export const messagePinV1 = (token: string, messageId: number) => {
  const data: dataTs = getData();
  let inChannel = true;
  let inDm = true;
  // MESSAGE OBJECT = either channel or dm
  let dms;
  const channel = getChannelFromMessageId(messageId);
  if (!channel) {
    dms = getDmFromMessageId(messageId);
    inChannel = false;
  }
  if (!dms) {
    inDm = false;
  }
  // --------- CHECKS IF IS MESSAGEID ISVALID -----------------------
  // Checks if messageId is in channel or a dm
  if ((!inChannel && !inDm) || (inChannel && inDm)) {
    throw HTTPError(400, 'Invalid messageId');
  }
  const uId = getUIdFromToken(token);
  // Check if user is in Channel
  let channelId: number;
  if (inChannel) {
    channelId = channel.channelId;
    if (!isMember(channelId, uId)) {
      throw HTTPError(400, 'not a member of messageId');
    }
  }
  // Check if user is in dm
  let dmId: number;
  if (inDm) {
    dmId = dms.dmId;
    if (!isDmMember(dmId, token)) {
      throw HTTPError(400, 'not a member of messageId');
    }
  }
  const msg = getMessage(messageId) as messages;
  // --------- CHECKS IF IS PINNED -----------------------
  if (msg.isPinned === true) {
    throw HTTPError(400, 'Already pinned');
  }
  // ----------CHECKS OWNER PERMISSION--------------------
  // IN CHANNEL
  if (inChannel && !isOwner(channelId, uId) && !isGlobalOwnerFromUid(uId)) {
    throw HTTPError(403, 'no Owner permission');
  }
  // IN DM
  if (inDm && !isDmOwner(dmId, uId)) {
    throw HTTPError(403, 'no Owner permission');
  }
  // ------------ Set isPinned to true -------------------
  if (inChannel) {
    let mIndex;
    const channelIndex = findChannelIndexWithMessage(messageId);
    const len = data.channels[channelIndex].messages.length;
    for (let i = 0; i < len; i++) {
      if (data.channels[channelIndex].messages[i].messageId === messageId) {
        mIndex = i;
        break;
      }
    }
    data.channels[channelIndex].messages[mIndex].isPinned = true;
  } else {
    let mIndex;
    const dmIndex = findDMIndexWithMessage(messageId);
    const len = data.dms[dmIndex].messages.length;
    for (let i = 0; i < len; i++) {
      if (data.dms[dmIndex].messages[i].messageId === messageId) {
        mIndex = i;
        break;
      }
    }
    data.dms[dmIndex].messages[mIndex].isPinned = true;
  }
  setData(data);
  return {};
};

/**
 *
 * @param token
 * @param messageId
 * @returns none
 * @method POST
 * @summary
 * Given a message within a channel or DM, removes its mark as "pinned".
 */
export const messageUnpinV1 = (token: string, messageId: number) => {
  const data: dataTs = getData();
  let inChannel = true;
  let inDm = true;
  // MESSAGE OBJECT = either channel or dm
  let dms;
  const channel = getChannelFromMessageId(messageId);
  if (!channel) {
    dms = getDmFromMessageId(messageId);
    inChannel = false;
  }
  if (!dms) {
    inDm = false;
  }
  // --------- CHECKS IF IS MESSAGEID ISVALID -----------------------
  // Checks if messageId is in channel or a dm
  if ((!inChannel && !inDm) || (inChannel && inDm)) {
    throw HTTPError(400, 'Invalid messageId');
  }
  const uId = getUIdFromToken(token);
  // Check if user is in Channel
  let channelId: number;
  if (inChannel) {
    channelId = channel.channelId;
    if (!isMember(channelId, uId)) {
      throw HTTPError(403, 'not a member of messageId');
    }
  }
  // Check if user is in dm
  let dmId: number;
  if (inDm) {
    dmId = dms.dmId;
    if (!isDmMember(dmId, token)) {
      throw HTTPError(400, 'not a member of messageId');
    }
  }
  const msg = getMessage(messageId) as messages;
  // --------- CHECKS IF IS PINNED -----------------------
  if (msg.isPinned === false) {
    throw HTTPError(400, 'message was not pinned');
  }
  // ----------CHECKS OWNER PERMISSION--------------------
  // IN CHANNEL
  if (inChannel && !isOwner(channelId, uId) && !isGlobalOwnerFromUid(uId)) {
    throw HTTPError(403, 'no Owner permission');
  }
  // IN DM
  if (inDm && !isDmOwner(dmId, uId)) {
    throw HTTPError(403, 'no Owner permission');
  }
  // ------------ Set isPinned to false -------------------
  if (inChannel) {
    let mIndex;
    const channelIndex = findChannelIndexWithMessage(messageId);
    const len = data.channels[channelIndex].messages.length;
    for (let i = 0; i < len; i++) {
      if (data.channels[channelIndex].messages[i].messageId === messageId) {
        mIndex = i;
        break;
      }
    }
    data.channels[channelIndex].messages[mIndex].isPinned = false;
  } else {
    let mIndex;
    const dmIndex = findDMIndexWithMessage(messageId);
    const len = data.dms[dmIndex].messages.length;
    for (let i = 0; i < len; i++) {
      if (data.dms[dmIndex].messages[i].messageId === messageId) {
        mIndex = i;
        break;
      }
    }
    data.dms[dmIndex].messages[mIndex].isPinned = false;
  }
  setData(data);
  return {};
};

/**
 * @param token
 * @param messageId
 * @param reactId
 * @returns none
 * @method POST
 * @summary
 * Given a message within a channel or
 * DM the authorised user is part of, adds a "react" to that particular message.
 */
export const messageReactV1 = (token: string, messageId: number, reactId: number) => {
  if (!validateToken(token)) {
    throw HTTPError(403, 'Invalid token');
  }
  const data: dataTs = getData();
  let inChannel = true;
  let inDm = true;
  let dms;
  const channel = getChannelFromMessageId(messageId);
  if (!channel) {
    dms = getDmFromMessageId(messageId);
    inChannel = false;
  }
  if (!dms) {
    inDm = false;
  }
  // --------- CHECKS IF IS MESSAGEID ISVALID -----------------------
  // Checks if messageId is in channel or a dm
  if ((!inChannel && !inDm) || (inChannel && inDm)) {
    throw HTTPError(400, 'Invalid messageId');
  }
  const uId = getUIdFromToken(token);
  // Check if user is in Channel
  let channelId: number;
  if (inChannel) {
    channelId = channel.channelId;
    if (!isMember(channelId, uId) && uId !== 1) {
      throw HTTPError(400, 'not a member of messageId');
    }
  }
  // Check if user is in dm
  let dmId: number;
  if (inDm) {
    dmId = dms.dmId;
    if (!isDmMember(dmId, token)) {
      throw HTTPError(400, 'not a member of messageId');
    }
  }
  if (reactId !== 1) {
    throw HTTPError(400, 'Invalid ReactId');
  }
  const msg = getMessage(messageId) as messages;
  const indexReactId = reactId - 1;
  if (msg.reacts[indexReactId].uIds.find(a => a === uId)) {
    throw HTTPError(400, 'Already reacted');
  }
  if (inChannel) {
    let mIndex;
    const channelIndex = findChannelIndexWithMessage(messageId);
    const len = data.channels[channelIndex].messages.length;
    for (let i = 0; i < len; i++) {
      if (data.channels[channelIndex].messages[i].messageId === messageId) {
        mIndex = i;
        break;
      }
    }
    data.channels[channelIndex].messages[mIndex].reacts[0].uIds.push(uId);
  } else {
    let mIndex;
    const dmIndex = findDMIndexWithMessage(messageId);
    const len = data.dms[dmIndex].messages.length;
    for (let i = 0; i < len; i++) {
      if (data.dms[dmIndex].messages[i].messageId === messageId) {
        mIndex = i;
        break;
      }
    }
    data.dms[dmIndex].messages[mIndex].reacts[0].uIds.push(uId);
  }
  setData(data);

  // add notification
  reactNotification(messageId, token);

  return {};
};

/**
 * @param token
 * @param messageId
 * @param reactId
 * @returns none
 * @method POST
 * @summary
 * Given a message within a channel
 * or DM the authorised user is part of, removes a "react" to that particular message.
 */
export const messageUnreactV1 = (token: string, messageId: number, reactId: number) => {
  if (!validateToken(token)) {
    throw HTTPError(403, 'Invalid token');
  }
  const data: dataTs = getData();
  let inChannel = true;
  let inDm = true;
  let dms;
  const channel = getChannelFromMessageId(messageId);
  if (!channel) {
    dms = getDmFromMessageId(messageId);
    inChannel = false;
  }
  if (!dms) {
    inDm = false;
  }
  // --------- CHECKS IF IS MESSAGEID ISVALID -----------------------
  // Checks if messageId is in channel or a dm
  if ((!inChannel && !inDm) || (inChannel && inDm)) {
    throw HTTPError(400, 'Invalid messageId');
  }
  const uId = getUIdFromToken(token);
  // Check if user is in Channel
  let channelId: number;
  if (inChannel) {
    channelId = channel.channelId;
    if (!isMember(channelId, uId) && uId !== 1) {
      throw HTTPError(400, 'not a member of messageId');
    }
  }
  // Check if user is in dm
  let dmId: number;
  if (inDm) {
    dmId = dms.dmId;
    if (!isDmMember(dmId, token)) {
      throw HTTPError(400, 'not a member of messageId');
    }
  }
  if (reactId !== 1) {
    throw HTTPError(400, 'Invalid ReactId');
  }
  const msg = getMessage(messageId) as messages;
  const indexReactId = reactId - 1;
  if (!msg.reacts[indexReactId].uIds.find(a => a === uId)) {
    throw HTTPError(400, 'no reactions');
  }
  // const user = getUser(uId);
  const indexToRemove = msg.reacts[indexReactId].uIds.findIndex(a => a === uId);
  if (inChannel) {
    let mIndex;
    const channelIndex = findChannelIndexWithMessage(messageId);
    const len = data.channels[channelIndex].messages.length;
    for (let i = 0; i < len; i++) {
      if (data.channels[channelIndex].messages[i].messageId === messageId) {
        mIndex = i;
        break;
      }
    }
    data.channels[channelIndex].messages[mIndex].reacts[0].uIds.splice(indexToRemove, 1);
  } else {
    let mIndex;
    const dmIndex = findDMIndexWithMessage(messageId);
    const len = data.dms[dmIndex].messages.length;
    for (let i = 0; i < len; i++) {
      if (data.dms[dmIndex].messages[i].messageId === messageId) {
        mIndex = i;
        break;
      }
    }
    data.dms[dmIndex].messages[mIndex].reacts[0].uIds.splice(indexToRemove, 1);
  }
  setData(data);
  return {};
};

/**
 *
 * @param token
 * @param ogMessageId
 * @param message
 * @param channelId
 * @param dmId
 * @returns { sharedMessageId }
 * @method POST
 * @summary
 * ogMessageId is the ID of the original message.
 * channelId is the channel that the message is being shared to, and is -1
 * if it is being sent to a DM. dmId is the DM that the message is being
 * shared to, and is -1 if it is being sent to a channel. message is the
 * optional message in addition to the shared message, and will be an empty
 * string '' if no message is given.
 *
 * A new message containing the contents of both the original message and
 * the optional message should be sent to the channel/DM identified by the
 * channelId/dmId. The format of the new message does not matter as long
 * as both the original and optional message exist as a substring within
 * the new message. Once sent, this new message has no link to the original
 * message, so if the original message is edited/deleted, no change will
 * occur for the new message.
 */
export const messageShareV1 = (token: string, ogMessageId: number, message: string, channelId: number, dmId: number) => {
  let toChannel = false;
  let toDms = false;
  if (!validateToken(token)) {
    throw HTTPError(403, 'Invalid token');
  }
  if (channelId === -1 && dmId === -1) {
    throw HTTPError(400, 'both channelId and dmId is -1');
  }
  if (!(channelId === -1 || dmId === -1)) {
    throw HTTPError(400, 'either channelId/dmId must be -1');
  }
  if (!isChannelIdValid(channelId) && !isDmIdValid(dmId)) {
    throw HTTPError(400, 'Invalid dmId/channelId');
  }
  (channelId === -1) ? toDms = true : toChannel = true;
  // -------------- Test ogMessageId -------------------------------
  const ogMessage = (getMessage(ogMessageId) as messages).message;
  if (!ogMessage) {
    throw HTTPError(400, 'Invalid ogMessageId');
  }
  if (!(message.length <= 1000)) {
    throw HTTPError(400, 'message must be between 1 to 1000 letters');
  }
  const uId = getUIdFromToken(token) as number;
  if (toChannel) {
    if (!isMember(channelId, uId)) {
      throw HTTPError(403, 'user not a member of Channel');
    }
  }
  if (toDms) {
    if (!isDmMember(dmId, token)) {
      throw HTTPError(403, 'user not a member of Dms');
    }
  }
  const note = `${ogMessage}, Note: ${message}`;
  let sharedMessageId;
  if (toChannel) {
    sharedMessageId = messageSendV2(token, channelId, note).messageId;
  }
  if (toDms) {
    sharedMessageId = messageSenddmV2(token, dmId, note).messageId;
  }
  return { sharedMessageId: sharedMessageId };
};
