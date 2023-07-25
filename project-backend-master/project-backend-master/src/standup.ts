import HTTPError from 'http-errors';
import { getData, setData } from './dataStore';
import { standupActive, dataTs, channel, timeFinish } from './interfaces';
import { sendMessages, getUIdFromToken, isChannelIdValid, isMember, validateToken, getChannel, getUser } from './helper';

/**
 * Summary: Starts a standup that lasts length seconds
 *
 * Description:
 * For a given channel, starts a standup period lasting length seconds.
 * During this standup period, if someone calls standup/send with a message,
 * it will be buffered during the length-second window. Then, at the end of the
 * standup, all buffered messages are packaged into one message, and this
 * packaged message is sent to the channel from the user who started the
 * standup: see section 6.13. for more details. If no standup messages are sent
 * during the standup, no message should be sent at the end.
 *
 * @param {string} token - User's unique token
 * @param {number} channelId - Channel's unique ID
 * @param {number} length - Length of standup.
 * @method POST
 * @returns {timeFinish: number}
 */

export function standupStartV1(token: string, channelId: number, length: number): timeFinish {
  const data: dataTs = getData();

  if (!validateToken(token)) {
    throw HTTPError(403, 'Invalid token');
  }

  if (!isChannelIdValid(channelId)) {
    throw HTTPError(400, 'Invalid ChannelId');
  }

  if (length < 0) {
    throw HTTPError(400, 'The length of a standup must be positive');
  }

  if (standupActiveV1(token, channelId).isActive) {
    throw HTTPError(400, 'A standup is already running in this channel');
  }

  const uId = getUIdFromToken(token);
  if (!isMember(channelId, uId)) {
    throw HTTPError(403, 'This user does not have the correct permissions');
  }

  const timeFinish = Math.floor(Date.now() / 1000) + length;

  const channelIndex: number = data.channels.findIndex(channel => channel.channelId === channelId);
  data.channels[channelIndex].standup.isActive = true;
  data.channels[channelIndex].standup.timeFinish = timeFinish;
  data.channels[channelIndex].standup.authUserId = uId;

  setData(data);
  setTimeout(
    () => sendMessages(channelId, uId, timeFinish),
    length * 1000
  );

  return { timeFinish: timeFinish };
}

/**
 * Summary: Returns whether a standup is active in a specified channel
 *
 * Description:
 * For a given channel, returns whether a standup is active in it, and what time
 * the standup finishes. If no standup is active, then timeFinish should be null
 *
 *
 * @param {number} channelId - Channel's unique ID
 * @method GET
 * @returns {isActive: boolean, timeFinish: number}
 */
export function standupActiveV1(token: string, channelId: number): standupActive {
  if (!isChannelIdValid(channelId)) {
    throw HTTPError(400, 'Invalid ChannelId');
  }

  if (!validateToken(token)) {
    throw HTTPError(403, 'Invalid Token');
  }

  const uId: number = getUIdFromToken(token);
  if (!isMember(channelId, uId)) {
    throw HTTPError(403, 'This authorised user is not a member of this channel');
  }

  const channel: channel = getChannel(channelId) as channel;
  const returnObj: standupActive = {
    isActive: channel.standup.isActive,
    timeFinish: channel.standup.timeFinish
  };

  return returnObj;
}

/**
 * Summary: Sends a message within a specified channel's standup.
 *
 * Description:
 * For a given channel, if a standup is currently active in the channel, sends a
 * message to get buffered in the standup queue. Note: @ tags should not be
 * parsed as proper tags (i.e. no notification should be triggered on send, or
 * when the standup finishes)
 *
 * @param {number} channelId - Channel's unique ID
 * @param {string} message - Message to be sent.
 * @method POST
 * @returns {timeFinish: number}
 */
export function standupSendV1(token: string, channelId: number, message: string) {
  const data: dataTs = getData();
  if (!validateToken(token)) {
    throw HTTPError(403, 'Invalid token');
  }

  if (!isChannelIdValid(channelId)) {
    throw HTTPError(400, 'Invalid ChannelId');
  }

  if (message.length > 1000) {
    throw HTTPError(400, 'Messages cannot be longer than 1000 characters');
  }

  if (!standupActiveV1(token, channelId).isActive) {
    throw HTTPError(400, 'A standup is not running in this channel');
  }

  const uId = getUIdFromToken(token);
  if (!isMember(channelId, uId)) {
    throw HTTPError(403, 'This user does not have the correct permissions');
  }

  const channelIndex: number = data.channels.findIndex(channel => channel.channelId === channelId);
  const userhandle: string = getUser(uId).handleStr;

  data.channels[channelIndex].standup.standupMessage += userhandle + ': ' + message + '\n';
  setData(data);

  return {};
}
