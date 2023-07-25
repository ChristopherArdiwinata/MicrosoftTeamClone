// import { isToken } from 'typescript';
import { getData, setData } from './dataStore';
import { getUIdFromToken, userIndexToken, validateToken } from './helper';
import { error, channel, channelId, channels } from './interfaces';
import HTTPError from 'http-errors';

/**
 * @param {string} token - Unique Id of a user
 * @param {string} name - Desired name for a new channel
 * @param {boolean} isPublic - Desired setting for the channel's privacy
 * @returns {error: 'string'} - Error Message - Error message describing the error cause
 * @returns {channelId: number} - The unique channelId that gets created upon creating a new channel
 * @method POST
 * @summary
 * When given a valid name and token, the function will create a unique
 * channelId, and after it will create a new object containing; channelId, ownerId,
 * adminIds, memberIds, channelName, isPublic, messages. Then will set this new object into
 * the array named "channels", in the dataStore.js file using the setData function
 */

export function channelsCreateV3(token: string, name: string, isPublic: boolean): channelId | error {
  const data = getData();

  // Error cases:
  // name is less than 1 character
  if (name.length < 1) {
    throw HTTPError(400, 'name is less than 1 character');
  }

  // name is more than 20 characters
  if (name.length > 20) {
    throw HTTPError(400, 'name is more than 20 characters');
  }

  // token is invalid
  if (!validateToken(token)) {
    throw HTTPError(403, 'Token is not valid');
  }

  // Find and assign a suitable channelId
  let channelId: number;
  if (data.channels.length === 0) {
    channelId = 1;
  } else if (data.channels.length > 0) {
    channelId = data.channels[data.channels.length - 1].channelId + 1;
  }

  const userId = getUIdFromToken(token);
  const userIndex = data.users.findIndex(user => user.uId === userId);

  const newChannel: channel = {
    channelId: channelId,
    name: name,
    isPublic: isPublic,
    ownerMembers: [{
      uId: data.users[userIndex].uId,
      email: data.users[userIndex].email,
      nameFirst: data.users[userIndex].nameFirst,
      nameLast: data.users[userIndex].nameLast,
      handleStr: data.users[userIndex].handleStr,
    }],
    allMembers: [{
      uId: data.users[userIndex].uId,
      email: data.users[userIndex].email,
      nameFirst: data.users[userIndex].nameFirst,
      nameLast: data.users[userIndex].nameLast,
      handleStr: data.users[userIndex].handleStr,
    }],
    messages: [],
    standup: {
      standupMessage: '',
      isActive: false,
      timeFinish: null,
      authUserId: null
    }
  };

  data.channels.push(newChannel);

  setData(data);

  return { channelId: channelId };
}

/**
 * @param {string} token - Unique Id of the user
 * @returns {error: 'string'} - Error Message - Error message describing the error cause
 * @returns {channels: [{channelId: number}, {name: 'string'}]} - Array of channels that the user is a part of
 * @method GET
 * @summary
 * If the inputted token is valid, as in it exists in the array of users,
 * then this function will traverse through all existing channels using a for loop
 * and if this member is a part of that channel then it will add it to a new array containing
 * that channel's Id and name.
 * Once the for loop is complete, then the function will return an array of objects
 * where the objects have the channel's Ids and names. However, it will return and error
 * if anything was unsuccesful
 */

export function channelsListV3(token: string): { channels: channels[] } | error {
  const data = getData();

  // Error if invalid
  // const userIndex = data.users.findIndex(element => element.token.includes(token));
  const userIndex = userIndexToken(token);
  if (userIndex === -1) {
    throw HTTPError(403, 'Token is not valid');
  }

  const userId = data.users[userIndex].uId;

  const channels: channels[] = [];

  for (const channel of data.channels) {
    const hasToken = channel.allMembers.find(member => member.uId === userId);

    if (hasToken !== undefined) {
      const currChannel = {
        channelId: channel.channelId,
        name: channel.name
      };

      channels.push(currChannel);
    }
  }
  return { channels: channels };
}

/**
 * @param {string} token - Unique Id of the user
 * @returns {error: 'string'} - Error Message - Error message describing the error cause
 * @returns {channels: [{channelId: number}, {name: 'string'}]} - Array of all channels
 * @method GET
 * @summary
 * If the inputted token is valid, as in it exists in the array of users,
 * then this function will traverse through all existing channels using a for loop
 * then it will add it to a new array containing that channel's Id and name.
 * Once the for loop is complete, then the function will return an array of objects
 * where the objects have the channel's Ids and names. However, it will return
 * an error if it was unsuccessful
 */
export function channelsListAllV3(token: string): { channels: channels[] } | error {
  const data = getData();

  // const userIndex = data.users.findIndex(element => element.token.includes(token));
  const userIndex = userIndexToken(token);
  if (userIndex === -1) {
    throw HTTPError(403, 'Token is not valid');
  }

  const allChannels: channels[] = [];

  for (const a of data.channels) {
    allChannels.push({
      channelId: a.channelId,
      name: a.name,
    });
  }

  return { channels: allChannels };
}
