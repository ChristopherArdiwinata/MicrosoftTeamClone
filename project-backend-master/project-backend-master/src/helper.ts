import { getData, setData } from './dataStore';
import { channel, user, dms, password, users, dataTs } from './interfaces';

import md5 from 'md5';
import crypto from 'crypto';

// Global Variables
const randomWord = 'yT95GGuk3FGVzcaFfPXb';
const algorithm = 'aes-256-cbc';
const key = crypto.randomBytes(32);
const iv = crypto.randomBytes(16);

// NOTE: checkExsists param "array" needs attention

// HELPER FUNCTION
/**
 * @param {number} searchID      - the unique ID to search for in the array
 * @param {integer} array        - an array of IDS
 * @returns {integer | boolean}  - either the index of search ID, or false if unfound
 * @summary check if an object exists in an array of objects based on searchID ,
 *  returns the index of that object if it exists, otherwise returns false
 */
// export const checkExists = (searchID: number, array: number[]): number | boolean => {
//   let i = 0;
//   for (const element of array) {
//     // the ID of a channel or user is always the first value in both objects
//     const currentID = Object.values(element)[0];
//     if (currentID === searchID) {
//       return i;
//     }
//     i++;
//   }
//   return false;
// };

/**
 * @param {integer} authUserId
 * @returns {boolean}
 * @summary check  if authUserId is valid/notValid
 */
export const isUserIdValid = (userId: number): boolean => {
  const dataStore = getData();
  for (const a of dataStore.users) {
    if (a.uId === userId) return true;
  }
  return false;
};
/**
 * @param {integer} channelId
 * @returns {boolean}
 * @summary check  if channelId is valid/notValid
 */
export const isChannelIdValid = (channelId: number): boolean => {
  const dataStore = getData();
  for (const a of dataStore.channels) {
    if (a.channelId === channelId) return true;
  }
  return false;
};

/**
 * @param channelId
 * @returns the channel object or false
 * @sum get the channel object of channelId
 */
export const getChannel = (channelId: number): channel | boolean => {
  const data = getData();
  const channel = data.channels.find(a => a.channelId === channelId);
  return channel !== undefined ? channel : false;
};

/**
 * @param channelId
 * @param uId
 * @returns  true/false
 * @summary check if uId is member of channelId
 */
export const isMember = (channelId: number, uId: number): boolean => {
  const channel = getChannel(channelId) as channel || false;
  if (!channel) return false;
  const value = channel.allMembers.find(a => a.uId === uId);
  return value !== undefined;
};

/**
 * @param channelId
 * @param uId
 * @returns  true/false
 * @summary checks if uId is Owner of channelId
 */
export const isOwner = (channelId: number, uId: number): boolean => {
  const channel = getChannel(channelId) as channel;
  const value = channel.ownerMembers.find(a => a.uId === uId);
  return value !== undefined;
};

/**
 * @param channelId
 * @param uId
 * @summary Not Global owner permission , checks if uId is an owner (?);
 */
export const isOwnerByToken = (channelId: number, token: string): boolean => {
  const uId = getUIdFromToken(token) as number;
  return isOwner(channelId, uId);
};

/**
 * @param {token:string}
 * @return {true/false}
 */

/// ////////// DEPRECATED //////////////////
// export const isTokenValid = (token: string): boolean => {
//   return !!getUIdFromToken(token);
// };

/**
 * @returns messageId thats unique
 */
export const createMessageId = (): number => {
  const data = getData();
  let id = Math.floor(Math.random() * 10000);
  const findId = (n: channel) => {
    return n.messages.find(mId => mId.messageId === id) !== undefined;
  };
  while (data.channels.find(findId) !== undefined) {
    id = Math.floor(Math.random() * 10000);
  }
  return id;
};

/**
 * @param token
 * @returns returns the uId from a token
 * , or returns false
 */
export const getUIdFromToken = (token: string): number => {
  const data = getData();
  const foundToken = data.users.find(element => element.token.find(element => element === hashToken(token)));

  // if (foundToken === undefined) {
  //   return false;
  // }
  return foundToken.uId;
};

export const getHandle = (uId: number): string => {
  const data = getData();

  const user = data.users.find(element => element.uId === uId) as user;

  return user.handleStr;
};

export const getUser = (uId: number): typeof user => {
  const data = getData();
  const user = data.users.find(element => element.uId === uId) as user;
  const member: typeof user = {
    uId: user.uId,
    email: user.email,
    nameFirst: user.nameFirst,
    nameLast: user.nameLast,
    handleStr: user.handleStr,
  };

  return member;
};
// getDm = gets dms object;
export const getDm = (dmId: number): dms | boolean => {
  const data = getData();
  const dm = data.dms.find(a => a.dmId === dmId);
  return dm !== undefined ? dm : false;
};
export const isDmMember = (dmId: number, token: string): boolean => {
  const uId = getUIdFromToken(token) as number;
  const dm = getDm(dmId) as dms || false;
  if (!dm) return false;
  return dm.members.find(dmMember => dmMember.uId === uId) !== undefined;
};

export const isDmIdValid = (dmId: number): boolean => {
  const status = !!getDm(dmId);
  if (!status) return false;
  return true;
};

/**
 *
 * @param messageId
 * @returns {boolean | number}
 * Searches all channels for a message with messageId. Returns the index of the
 * channel in the datastore if found and false if unfound.
 */
export const isMessageInChannel = (messageId: number): boolean => {
  const data = getData();
  for (const channel of data.channels) {
    if (channel.messages.find(message => message.messageId === messageId)) {
      return true;
    }
  }
  return false;
};

export const findChannelIndexWithMessage = (messageId: number): number => {
  const data = getData();
  for (let channelIndex = 0; channelIndex < data.channels.length; channelIndex++) {
    if (data.channels[channelIndex].messages.find(message => message.messageId === messageId)) {
      return channelIndex;
    }
  }
  return -1;
};

/**
 *
 * @param messageId
 * @returns {boolean | number}
 * Searches all channels for a message with messageId. Returns true if the
 * message was found in a DM.
 */
export const isMessageInDM = (messageId: number): boolean => {
  const data = getData();
  for (const dm of data.dms) {
    if (dm.messages.find(message => message.messageId === messageId)) {
      return true;
    }
  }
  return false;
};
/**
 *
 * @param messageId
 * @returns dmIndex
 */
export const findDMIndexWithMessage = (messageId: number): number => {
  const data = getData();
  for (let dmIndex = 0; dmIndex < data.dms.length; dmIndex++) {
    if (data.dms[dmIndex].messages.find(message => message.messageId === messageId)) {
      return dmIndex;
    }
  }
  return -1;
};

export const hashToken = (str: string): string => {
  return md5(str + randomWord);
};

export const validateToken = (token: string): boolean => {
  const data = getData();
  const found = data.users.find(element => element.token.find(element => element === hashToken(token)));

  if (found !== undefined) {
    return true;
  } else {
    return false;
  }
};

export const userIndexToken = (token: string): number => {
  const data: dataTs = getData();
  return data.users.findIndex(element => element.token.find(element => element === hashToken(token)));
};

export const userObjToken = (token: string): users => {
  const data: dataTs = getData();
  return data.users.find(element => element.token.find(element => element === hashToken(token)));
};

export function encrypt(text: string): password {
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return {
    iv: iv.toString('hex'),
    encryptedData: encrypted.toString('hex')
  };
}

export function decrypt(text: password): string {
  const iv = Buffer.from(text.iv, 'hex');
  const encryptedText = Buffer.from(text.encryptedData, 'hex');

  const decipher = crypto.createDecipheriv(algorithm, Buffer.from(key), iv);

  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString();
}

export const findPassword = (pass: string): boolean => {
  const data = getData();

  const foundPassword = data.users.find(element => decrypt(element.password) === pass);

  if (foundPassword !== undefined) {
    return true;
  } else {
    return false;
  }
};

export const getIdFromMessage = (messageId: number) => {
  const data = getData();
  let msg;
  for (const channel of data.channels) {
    msg = channel.messages.find(message => message.messageId === messageId);
    if (msg !== undefined) {
      return {
        type: 'channel',
        Id: channel.channelId,
        uId: msg.uId
      };
    }
  }
  for (const dm of data.dms) {
    msg = dm.messages.find(message => message.messageId === messageId);
    if (msg !== undefined) {
      return {
        type: 'dm',
        Id: dm.dmId,
        uId: msg.uId
      };
    }
  }
};

export const isGlobalOwnerFromUid = (uId: number): boolean => {
  const data = getData();

  const uIdObject = data.users.find(element => element.uId === uId);

  if (uIdObject?.permissionId === 1) {
    return true;
  } else {
    return false;
  }
};

// export const isGlobalOwnerFromToken = (token: string): boolean => {
//   const uId = getUIdFromToken(token) as number;
//   return isGlobalOwnerFromUid(uId);
// };

// export const getPermissionIdFromUid = (uId: number) => {
//   const data = getData();
//   const uIdObject = data.users.find(element => element.uId === uId);
//   return uIdObject?.permissionId;
// };

export const userIndexUid = (uId: number): number => {
  const data: dataTs = getData();
  return data.users.findIndex(element => element.uId === uId);
};

// export const isGlobalOwnerFromUid1 = (uId: number): boolean => {
//   const data = getData();

//   const uIdObject = data.users.find(element => element.uId === uId);

//   if (uIdObject?.permissionId === 1) {
//     return true;
//   } else {
//     return false;
//   }
// };

export const isGlobalOwnerFromToken1 = (token: string): boolean => {
  const uId = getUIdFromToken(token) as number;
  return isGlobalOwnerFromUid(uId);
};

export const getPermissionIdFromUid1 = (uId: number) => {
  const data = getData();
  const uIdObject = data.users.find(element => element.uId === uId);
  return uIdObject?.permissionId;
};

export const userIndexUid1 = (uId: number): number => {
  const data: dataTs = getData();
  return data.users.findIndex(element => element.uId === uId);
};

/**
 * Summary: Sends all buffered standup messages at the end of a standup
 *
 * Description:
 * Once timeFinish has been reached for the standup, this function is called.
 * Searches for the channel via the specified channelId and stores the message
 * in a variable. Resets the standup to an empty status before pushing the
 * message to the channel's messages, using parameters inputted in the function.
 *
 * @param {number} channelId - Channel's unique ID
 * @param {number} uId - User's unique ID
 * @param {number} timeFinish - Standup's expected time to finish.
 */

export function sendMessages(channelId: number, uId: number, timeFinish: number) {
  const channel: channel = getChannel(channelId) as channel;
  const message: string = channel.standup.standupMessage.trim();

  const data: dataTs = getData();
  const channelIndex: number = data.channels.findIndex(channel => channel.channelId === channelId);

  data.channels[channelIndex].standup.isActive = false;
  data.channels[channelIndex].standup.timeFinish = null;
  data.channels[channelIndex].standup.authUserId = null;
  data.channels[channelIndex].standup.standupMessage = '';

  if (message.length === 0) {
    setData(data);
    return {};
  }

  const messageId = createMessageId();
  data.channels[channelIndex].messages.push({
    messageId: messageId,
    uId: uId,
    message: message,
    timeSent: timeFinish,
    reacts: [{
      reactId: 1,
      uIds: []
    }],
    isPinned: false
  });

  setData(data);
}
