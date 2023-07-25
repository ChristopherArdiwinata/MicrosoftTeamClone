// import { getData } from './dataStore';
// import { validateToken, getUIdFromToken, isMember, isDmMember } from './helper';
// import { isDmIdValid, isChannelIdValid } from './helper';
// import { dataTs, messages } from './interfaces';
// import { messageSendV2, messageSenddmV2 } from './message';
// import HTTPError from 'http-errors';

// /**
//  * @param {number} messageId
//  * @returns {object} msg object
//  * @summary Gets message object
//  */
// export const getMessage = (messageId: number): messages | boolean => {
//   const data: dataTs = getData();
//   let msg;
//   for (const channel of data.channels) {
//     msg = channel.messages.find(message => message.messageId === messageId);
//     if (msg) {
//       return msg;
//     }
//   }
//   for (const dm of data.dms) {
//     msg = dm.messages.find(message => message.messageId === messageId);
//     if (msg) {
//       return msg;
//     }
//   }
//   return false;
// };
// /**
//  *
//  * @param token
//  * @param ogMessageId
//  * @param message
//  * @param channelId
//  * @param dmId
//  * @returns { sharedMessageId }
//  * @method POST
//  * @summary
//  * ogMessageId is the ID of the original message.
//  * channelId is the channel that the message is being shared to, and is -1
//  * if it is being sent to a DM. dmId is the DM that the message is being
//  * shared to, and is -1 if it is being sent to a channel. message is the
//  * optional message in addition to the shared message, and will be an empty
//  * string '' if no message is given.
//  *
//  * A new message containing the contents of both the original message and
//  * the optional message should be sent to the channel/DM identified by the
//  * channelId/dmId. The format of the new message does not matter as long
//  * as both the original and optional message exist as a substring within
//  * the new message. Once sent, this new message has no link to the original
//  * message, so if the original message is edited/deleted, no change will
//  * occur for the new message.
//  */
// export const messageShareV1 = (token: string, ogMessageId: number, message: string, channelId: number, dmId: number) => {
//   let toChannel = false;
//   let toDms = false;
//   if (!validateToken(token)) {
//     throw HTTPError(403, 'Invalid token');
//   }
//   if (channelId === -1 && dmId === -1) {
//     throw HTTPError(400, 'both channelId and dmId is -1');
//   }
//   if (!(channelId === -1 || dmId === -1)) {
//     throw HTTPError(400, 'either channelId/dmId must be -1');
//   }
//   if (!isChannelIdValid(channelId) && !isDmIdValid(dmId)) {
//     throw HTTPError(400, 'Invalid dmId/channelId');
//   }
//   (channelId === -1) ? toDms = true : toChannel = true;
//   // -------------- Test ogMessageId -------------------------------
//   const ogMessage = (getMessage(ogMessageId) as messages).message;
//   if (!ogMessage) {
//     throw HTTPError(400, 'Invalid ogMessageId');
//   }
//   if (!(message.length <= 1000)) {
//     throw HTTPError(400, 'message must be between 1 to 1000 letters');
//   }
//   const uId = getUIdFromToken(token) as number;
//   if (toChannel) {
//     if (!isMember(channelId, uId)) {
//       throw HTTPError(403, 'user not a member of Channel');
//     }
//   }
//   if (toDms) {
//     if (!isDmMember(dmId, token)) {
//       throw HTTPError(403, 'user not a member of Dms');
//     }
//   }
//   const note = `${ogMessage}, Note: ${message}`;
//   let sharedMessageId;
//   if (toChannel) {
//     sharedMessageId = messageSendV2(token, channelId, note).messageId;
//   }
//   if (toDms) {
//     sharedMessageId = messageSenddmV2(token, dmId, note).messageId;
//   }
//   return { sharedMessageId: sharedMessageId };
// };
