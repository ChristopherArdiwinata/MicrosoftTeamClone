
import { getData, setData } from './dataStore';
import validator from 'validator';
import HTTPError from 'http-errors';
import { validateToken, userIndexToken } from './helper';

/**
 * For a valid user, returns information about their user ID,
 * email, first name, last name, and handle
 *
 * @param {string} authUserId
 * @param {string} uID
 * @returns {{user: object}}
 */

/**
 * set a new email for a user
 * @param {string} email
 * @returns {}
 */

export function userProfileSetemailV2(token: string, email: string) {
  const data = getData();
  if (!validateToken(token)) {
    throw HTTPError(403, 'token is not valid');
  }
  if (!(validator.isEmail(email))) {
    throw HTTPError(400, 'email is not valid');
  }
  const userObjectEmail = data.users.find(a => a.email === email);
  if (userObjectEmail !== undefined) {
    throw HTTPError(400, 'email is in use');
  }
  const userIndex = userIndexToken(token);
  data.users[userIndex].email = email;
  setData(data);
  return {};
}
/**
 * set a new handle for a user
 * @param {string} handleStr
 * @returns {}
 */

export function userProfileSethandleV2(token: string, handleStr: string) {
  const data = getData();
  if (!validateToken(token)) {
    throw HTTPError(403, 'token is not valid');
  }
  const userObjectHandleStr = data.users.find(a => a.handleStr === handleStr);
  if (userObjectHandleStr !== undefined) {
    throw HTTPError(400, 'handle is in use');
  }
  const noAlphanumeric = /^[a-zA-Z0-9]+$/i;
  if (!noAlphanumeric.test(handleStr)) {
    throw HTTPError(400, 'handleStr can not include non alphanumeric');
  }
  if ((handleStr.length > 20) || (handleStr.length < 3)) {
    throw HTTPError(400, 'length of handleStr is not between 3 and 20 characters inclusive');
  }
  const userIndex = userIndexToken(token);
  data.users[userIndex].handleStr = handleStr;

  setData(data);
  return {};
}

/**
 * set a new name for a user
 * @param {string} nameFirst
 * @param {string} nameLast
 * @returns {}
 */

export function userProfileSetnameV2(token: string, nameFirst: string, nameLast: string) {
  const data = getData();
  if (!validateToken(token)) {
    throw HTTPError(403, 'token is not valid');
  }
  if ((nameFirst.length > 50) || (nameFirst.length < 1)) {
    throw HTTPError(400, 'length of nameFirst is not between 1 and 50 characters inclusive');
  }
  if ((nameLast.length > 50) || (nameLast.length < 1)) {
    throw HTTPError(400, 'length of nameLast is not between 1 and 50 characters inclusive');
  }
  const userIndex = userIndexToken(token);
  data.users[userIndex].nameFirst = nameFirst;
  data.users[userIndex].nameLast = nameLast;
  setData(data);
  return {};
}
/**
 * view all users' detail
 * @returns {{users}}
 */

export function usersAllV2(token: string) {
  const data = getData();
  if (!validateToken(token)) {
    throw HTTPError(403, 'token is not valid');
  }
  const users = data.users
    .map(p => ({
      uId: p.uId,
      email: p.email,
      nameFirst: p.nameFirst,
      nameLast: p.nameLast,
      handleStr: p.handleStr,
      profileImgUrl: p.profileImgUrl
    }));
  return { users };
}
/**
 * view all users' detail
 * @param {string} uId
 * @returns {user}
 */

export function userProfileV3(token: string, uId: number) {
  const data = getData();
  let flag = 1;
  if (!validateToken(token)) {
    throw HTTPError(403, 'token is not valid');
  }
  const idToView = data.users.find(a => a.uId === uId);
  if (idToView === undefined) {
    if (data.deletedUsers.find(a => a.uId === uId) === undefined) {
      throw HTTPError(400, 'uId is not valid');
    } else {
      flag = 0;
    }
  }
  const idToViewD = data.deletedUsers.find(a => a.uId === uId);
  if (flag === 1) {
    return {
      user: {
        uId: idToView.uId,
        email: idToView.email,
        nameFirst: idToView.nameFirst,
        nameLast: idToView.nameLast,
        handleStr: idToView.handleStr,
        profileImgUrl: idToView.profileImgUrl
      }
    };
  } else {
    return {
      user: {
        uId: idToViewD.uId,
        email: idToViewD.email,
        nameFirst: idToViewD.nameFirst,
        nameLast: idToViewD.nameLast,
        handleStr: idToViewD.handleStr,
        profileImgUrl: idToViewD.profileImgUrl
      }
    };
  }
}
