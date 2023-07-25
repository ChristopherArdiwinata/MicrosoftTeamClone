// import { getData, setData } from './dataStore';
// import { getUIdFromToken, findChannelIndexWithMessage, findDMIndexWithMessage } from './helper';
// import { validateToken, isMember, isDmMember } from './helper';
// import { dataTs, messages, channel, dms } from './interfaces';
// import HTTPError from 'http-errors';

// const getChannelFromMessageId = (messageId: number): channel => {
//   const data: dataTs = getData();
//   return data.channels.find(channel => channel.messages.find(message => message.messageId === messageId));
// };

// const getDmFromMessageId = (messageId: number): dms => {
//   const data: dataTs = getData();
//   return data.dms.find(dm => dm.messages.find(message => message.messageId === messageId));
// };
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
//  * @param token
//  * @param messageId
//  * @param reactId
//  * @returns none
//  * @method POST
//  * @summary
//  * Given a message within a channel
//  * or DM the authorised user is part of, removes a "react" to that particular message.
//  */
// export const messageUnreactV1 = (token: string, messageId: number, reactId: number) => {
//   if (!validateToken(token)) {
//     throw HTTPError(403, 'Invalid token');
//   }
//   const data: dataTs = getData();
//   let inChannel = true;
//   let inDm = true;
//   let dms;
//   const channel = getChannelFromMessageId(messageId);
//   if (!channel) {
//     dms = getDmFromMessageId(messageId);
//     inChannel = false;
//   }
//   if (!dms) {
//     inDm = false;
//   }
//   // --------- CHECKS IF IS MESSAGEID ISVALID -----------------------
//   // Checks if messageId is in channel or a dm
//   if ((!inChannel && !inDm) || (inChannel && inDm)) {
//     throw HTTPError(400, 'Invalid messageId');
//   }
//   const uId = getUIdFromToken(token);
//   // Check if user is in Channel
//   let channelId: number;
//   if (inChannel) {
//     channelId = channel.channelId;
//     if (!isMember(channelId, uId) && uId !== 1) {
//       throw HTTPError(400, 'not a member of messageId');
//     }
//   }
//   // Check if user is in dm
//   let dmId: number;
//   if (inDm) {
//     dmId = dms.dmId;
//     if (!isDmMember(dmId, token)) {
//       throw HTTPError(400, 'not a member of messageId');
//     }
//   }
//   if (reactId !== 1) {
//     throw HTTPError(400, 'Invalid ReactId');
//   }
//   const msg = getMessage(messageId) as messages;
//   const indexReactId = reactId - 1;
//   if (!msg.reacts[indexReactId].uIds.find(a => a === uId)) {
//     throw HTTPError(400, 'no reactions');
//   }
//   // const user = getUser(uId);
//   const indexToRemove = msg.reacts[indexReactId].uIds.findIndex(a => a === uId);
//   if (inChannel) {
//     let mIndex;
//     const channelIndex = findChannelIndexWithMessage(messageId);
//     const len = data.channels[channelIndex].messages.length;
//     for (let i = 0; i < len; i++) {
//       if (data.channels[channelIndex].messages[i].messageId === messageId) {
//         mIndex = i;
//         break;
//       }
//     }
//     data.channels[channelIndex].messages[mIndex].reacts[0].uIds.splice(indexToRemove, 1);
//   } else {
//     let mIndex;
//     const dmIndex = findDMIndexWithMessage(messageId);
//     const len = data.dms[dmIndex].messages.length;
//     for (let i = 0; i < len; i++) {
//       if (data.dms[dmIndex].messages[i].messageId === messageId) {
//         mIndex = i;
//         break;
//       }
//     }
//     data.dms[dmIndex].messages[mIndex].reacts[0].uIds.splice(indexToRemove, 1);
//   }
//   setData(data);
//   return {};
// };
