// import { getData, setData } from './dataStore';
// import { isOwner, getUIdFromToken, isMember, isDmMember, findChannelIndexWithMessage, findDMIndexWithMessage, isGlobalOwnerFromUid } from './helper';
// // import { isDmOwner, getMessage } from './helper';
// import { getDm } from './helper';
// import { dataTs, channel, dms, messages } from './interfaces';
// import HTTPError from 'http-errors';
// // HELPER FUNCTIONS ADD LATER

// const getChannelFromMessageId = (messageId: number): channel => {
//   const data: dataTs = getData();
//   return data.channels.find(channel => channel.messages.find(message => message.messageId === messageId));
// };

// const getDmFromMessageId = (messageId: number): dms => {
//   const data: dataTs = getData();
//   return data.dms.find(dm => dm.messages.find(message => message.messageId === messageId));
// };
// const isDmOwner = (dmId: number, uId: number): boolean => {
//   const dms: dms = getDm(dmId) as dms;
//   return dms.creator.uId === uId;
// };

// /**
//  * @param messageId
//  * @returns
//  * Given a message within a channel or DM, removes its mark as "pinned".
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

// // /**
// //  *
// //  * @param token
// //  * @param messageId
// //  * @returns none
// //  * @method POST
// //  * @summary
// //  * Given a message within a channel or DM, removes its mark as "pinned".
// //  */
// // export const messageUnpinV1 = (token: string, messageId: number) => {
// //   const data: dataTs = getData();
// //   let inChannel = true;
// //   let inDm = true;
// //   // MESSAGE OBJECT = either channel or dm
// //   let dms;
// //   const channel = getChannelFromMessageId(messageId);
// //   if (!channel) {
// //     dms = getDmFromMessageId(messageId);
// //     inChannel = false;
// //   }
// //   if (!dms) {
// //     inDm = false;
// //   }
// //   // --------- CHECKS IF IS MESSAGEID ISVALID -----------------------
// //   // Checks if messageId is in channel or a dm
// //   if ((!inChannel && !inDm) || (inChannel && inDm)) {
// //     throw HTTPError(400, 'Invalid messageId');
// //   }
// //   const uId = getUIdFromToken(token);
// //   // Check if user is in Channel
// //   let channelId: number;
// //   if (inChannel) {
// //     channelId = channel.channelId;
// //     if (!isMember(channelId, uId)) {
// //       throw HTTPError(403, 'not a member of messageId');
// //     }
// //   }
// //   // Check if user is in dm
// //   let dmId: number;
// //   if (inDm) {
// //     dmId = dms.dmId;
// //     if (!isDmMember(dmId, token)) {
// //       throw HTTPError(400, 'not a member of messageId');
// //     }
// //   }
// //   const msg = getMessage(messageId) as messages;
// //   // --------- CHECKS IF IS PINNED -----------------------
// //   if (msg.isPinned === false) {
// //     throw HTTPError(400, 'message was not pinned');
// //   }
// //   // ----------CHECKS OWNER PERMISSION--------------------
// //   // IN CHANNEL
// //   if (inChannel && !isOwner(channelId, uId) && !isGlobalOwnerFromUid(uId)) {
// //     throw HTTPError(403, 'no Owner permission');
// //   }
// //   // IN DM
// //   if (inDm && !isDmOwner(dmId, uId)) {
// //     throw HTTPError(403, 'no Owner permission');
// //   }
// //   // ------------ Set isPinned to false -------------------
// //   if (inChannel) {
// //     let mIndex;
// //     const channelIndex = findChannelIndexWithMessage(messageId);
// //     const len = data.channels[channelIndex].messages.length;
// //     for (let i = 0; i < len; i++) {
// //       if (data.channels[channelIndex].messages[i].messageId === messageId) {
// //         mIndex = i;
// //         break;
// //       }
// //     }
// //     data.channels[channelIndex].messages[mIndex].isPinned = false;
// //   } else {
// //     let mIndex;
// //     const dmIndex = findDMIndexWithMessage(messageId);
// //     const len = data.dms[dmIndex].messages.length;
// //     for (let i = 0; i < len; i++) {
// //       if (data.dms[dmIndex].messages[i].messageId === messageId) {
// //         mIndex = i;
// //         break;
// //       }
// //     }
// //     data.dms[dmIndex].messages[mIndex].isPinned = false;
// //   }
// //   setData(data);
// //   return {};
// // };
