
import { error, dmId, user, dms, dmDetails, dmsOutput, dmMessages } from './interfaces';
import { validateToken, isUserIdValid, getHandle, getUser, getUIdFromToken, getDm, userObjToken } from './helper';
import { getData, setData } from './dataStore';
import HTTPError from 'http-errors';

/**
 *
 * @param {string} token - Unique token of a user
 * @param {number} dmId - Unique Id of the Dm to send a message to
 * @param {number} start - Start time
 * @returns {error: 'string'} - Error Message - Error message describing the error cause
 * @returns {messages: message[], start: number, end: number} - array of messages, start time, end time.
 * @method GET
 * @summary
 * When given a valid token, dmId, start time. The function will return an array of messages that were sent
 * after the start time. if something is unsuccessful it will return an error.
 */
export function dmMessagesV2(token: string, dmId: number, start: number): error | dmMessages {
  // get data from dataStore
  const data = getData();

  // errors:
  // case: token is invalid
  if (validateToken(token) !== true) {
    throw HTTPError(403, 'Token is not valid');
  }

  // case: dmId does not refer to a valid DM
  const findDm = data.dms.find(dm => dm.dmId === dmId);
  if (findDm === undefined) {
    throw HTTPError(400, 'dmId is not valid');
  }

  // case: start is greater than the total number of messages in the channel
  if (start > findDm.messages.length) {
    throw HTTPError(400, 'Start is greater than the total number of messages in the channel');
  }

  // get the user's details with the given token
  // const currUser = data.users.find(users => users.token.includes(token));
  const currUser = userObjToken(token);

  // case: dmId is valid and the authorised user is not a member of the DM
  const hasToken = findDm.members.find(user => user.uId === currUser.uId);
  // const hasToken = findDm.members.find(currUser);
  if (hasToken === undefined) {
    throw HTTPError(403, 'User is not a member of the DM');
  }

  // Set end
  let end;
  let endrange;
  const dm = getDm(dmId) as dms;
  if (findDm.messages.length > start + 50) {
    end = start + 50;
    endrange = end;
  } else {
    end = -1;
    endrange = dm.messages.length;
  }
  const messages = findDm.messages.reverse().slice(start, endrange);
  const returnMessage: any = [];
  for (let i = 0; i < messages.length; i++) {
    const status = messages[i].reacts[0].uIds.includes(currUser.uId);
    returnMessage.push({
      messageId: messages[i].messageId,
      uId: messages[i].uId,
      message: messages[i].message,
      timeSent: messages[i].timeSent,
      reacts: [{
        reactId: 1,
        uIds: messages[i].reacts[0].uIds,
        isThisUserReacted: status
      }],
      isPinned: messages[i].isPinned
    });
  }
  // return
  return {
    messages: returnMessage,
    start: start,
    end: end
  };
}

/**
 *
 * @param {string} token - Unique token of a user
 * @returns {error: 'string'} - Error Message - Error message describing the error cause
 * @returns {dms: [dmId: numeber, name: string]} - array of messages, start time, end time.
 * @method GET
 * @summary
 * When given a valid token. The function will return an array dms. If anything was unsuccesful
 * the function will return an error
 */
export function dmListV2(token: string): { dms: dmsOutput[] } | error {
  // error case: invalid token
  if (validateToken(token) !== true) {
    throw HTTPError(403, 'Token is not valid');
  }

  // get data from dataStore
  const data = getData();

  // get the user's uId with the given token
  const uId = getUIdFromToken(token);

  // Go through all dms and filter the ones this user is a member of
  const userDms = [];

  for (const currDms of data.dms) {
    if ((currDms.members.find(element => element.uId === uId)) !== undefined) {
      userDms.push({
        dmId: currDms.dmId,
        name: currDms.name
      });
    }
  }

  // return
  return { dms: userDms };
}

/**
 * Creates a new DM with the specified members.
 *
 * @function dmCreateV2
 * @param {string} token - The authentication token of the creator.
 * @param {number[]} uIds - An array of user IDs representing the DM members.
 * @returns {dmId | error} - The dmId of the newly created DM or an error if the inputs are not valid.
 * @throws {HTTPError} - If the token is not valid, a user ID is not valid, or the creator ID is in the list of uIds.
 * @method POST
 */
export function dmCreateV2(token: string, uIds: number[]): dmId {
  const data = getData();

  // Error Cases
  if (validateToken(token) === false) {
    throw HTTPError(403, 'Token is not valid');
  }

  for (const Id of uIds) {
    if (isUserIdValid(Id) === false) {
      throw HTTPError(400, 'A user Id is not valid');
    }
  }

  function hasDuplicates(arr: number[]): boolean {
    return new Set(arr).size !== arr.length;
  }

  if (hasDuplicates(uIds)) {
    throw HTTPError(400, 'uIds contains duplicates');
  }

  const creatorId = userObjToken(token).uId;

  const foundCreator = uIds.find(element => element === creatorId);

  if (foundCreator !== undefined) {
    throw HTTPError(400, 'Creator Id in list of uIds');
  }

  // Creating Dm
  const names: string[] = [];
  const membersS: user[] = [];

  membersS.push(getUser(creatorId));
  const creator = getUser(creatorId);
  names.push(getHandle(creatorId));

  for (const Id of uIds) {
    names.push(getHandle(Id));
    membersS.push(getUser(Id));
  }

  const dmId = Math.floor(Math.random() * Date.now());

  names.sort();

  const nameSorted = names.join(', ');

  const dm: dms = {
    dmId: dmId,
    name: nameSorted,
    creator: creator,
    members: membersS,
    messages: []
  };

  data.dms.push(dm);

  setData(data);

  return { dmId: dmId };
}

/**
 * Allows a user to leave a DM.
 *
 * @function dmLeaveV2
 * @param {string} token - The authentication token of the user leaving the DM.
 * @param {number} dmId - The ID of the DM the user wants to leave.
 * @returns {Object} - An empty object to indicate successful execution.
 * @throws {HTTPError} - If the dmId does not exist, the token is not valid, or the authorized user is no longer in the DM.
 * @method POST
 */
export function dmLeaveV2(token: string, dmId: number) {
  const data = getData();
  // Error Cases
  const foundDm = data.dms.find(element => element.dmId === dmId);
  if (foundDm === undefined) {
    throw HTTPError(400, 'dmId does not exist');
  }
  if (validateToken(token) !== true) {
    throw HTTPError(403, 'Token is not valid');
  }
  const authId = getUIdFromToken(token);
  const foundAuth = foundDm.members.find(element => element.uId === authId);
  if (foundAuth === undefined) {
    throw HTTPError(403, 'authorised user no longer in the DM');
  }

  // remove authorised user
  const dmIndex = data.dms.findIndex(element => element.dmId === dmId);
  const authIndex = data.dms[dmIndex].members.findIndex(element => element.uId === authId);
  data.dms[dmIndex].members.splice(authIndex, 1);

  setData(data);

  return {};
}

/**
 * Removes a DM if the authorized user is the creator of the DM.
 *
 * @function dmRemoveV2
 * @param {string} token - The authentication token of the user.
 * @param {number} dmId - The ID of the DM to remove.
 * @returns {Object} - An empty object to indicate successful execution.
 * @throws {HTTPError} - If the dmId does not exist, the token is not valid, the authorized user is not the creator, or the authorized user is no longer in the DM.
 * @method DELETE
 */
export function dmRemoveV2(token: string, dmId: number) {
  const data = getData();

  // Error Cases
  const foundDm = data.dms.find(element => element.dmId === dmId);
  if (foundDm === undefined) {
    throw HTTPError(400, 'dmId does not exist');
  }
  if (validateToken(token) !== true) {
    throw HTTPError(403, 'Token is not valid');
  }
  const creatorId = getUIdFromToken(token);
  if (creatorId !== foundDm.creator.uId) {
    throw HTTPError(403, 'authorised user is not the creator');
  }
  const foundCreator = foundDm.members.find(element => element.uId === creatorId);
  if (foundCreator === undefined) {
    throw HTTPError(403, 'authorised user no longer in the DM');
  }

  // Removing dm

  const dmIndex = data.dms.findIndex(element => element.dmId === dmId);
  data.dms.splice(dmIndex, 1);

  setData(data);

  return {};
}

/**
 *
 * @param {string} token - Unique token of a user
 * @param {number} dmId - Unique ID of a dm
 * @returns {error: 'string'} - Error Message - Error message describing the error cause
 * @returns {name: string, members: string} - array of messages, start time, end time.
 * @method GET
 * @summary
 * When given a valid token. The function will return details of the given dmId.
 * If there was anything unsuccesful the function will return an error
 */
export function dmDetailsV2(token: string, dmId: number): error | dmDetails {
  // get data from dataStore
  const data = getData();

  // errors:
  // case: token is invalid
  if (validateToken(token) === false) {
    throw HTTPError(403, 'Token is not valid');
  }

  // case: dmId does not refer to a valid DM
  const findDm = data.dms.find(dm => dm.dmId === dmId);
  if (findDm === undefined) {
    throw HTTPError(400, 'dmId is not valid');
  }

  // get the user's details with the given token
  const currUser = userObjToken(token);

  // case: dmId is valid and the authorised user is not a member of the DM
  const hasToken = findDm.members.find(user => user.uId === currUser.uId);
  if (hasToken === undefined) {
    throw HTTPError(403, 'User is not a member of the DM');
  }

  // return
  return {
    name: findDm.name,
    members: findDm.members
  };
}
