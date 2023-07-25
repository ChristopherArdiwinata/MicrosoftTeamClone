import { getData } from './dataStore';
import { getUser, getUIdFromToken, validateToken } from './helper';
import { messages, error } from './interfaces';
import HTTPError from 'http-errors';

/**
 *
 * @param {string} token - Unique token of a user
 * @param {string} queryStr - The desired string to search for
 * @returns {error: 'string'} - Error Message - Error message describing the error cause
 * @returns {messages: messages[]} - A string of messages
 * @method GET
 * @summary
 * When given a valid token, queryStr. The function will search through every message sent
 * in both Dms and Channels that the user is a part of. And then it will return a string of
 * messages if the queryStr is included in it. However, if it is unsuccessful it will return an
 * error.
 */
export function searchV1(token: string, queryStr: string): error | { messages: messages[] } {
  const data = getData();

  // Invalid token
  if (!validateToken(token)) {
    throw HTTPError(403, 'Invalid token');
  }

  // length of queryStr is less tahn 1 or over 1000 characters
  if (queryStr.length > 1000 || queryStr.length < 1) {
    throw HTTPError(400, 'message must be between 1 to 1000 letters');
  }

  const uId = getUIdFromToken(token);
  const user = getUser(uId);

  const messages = [];

  for (const channel of data.channels) {
    if (channel.allMembers.findIndex(element => element.uId === user.uId) >= 0) {
      for (const mess of channel.messages) {
        if (mess.message.includes(queryStr)) {
          messages.push(mess);
        }
      }
    }
  }

  for (const dm of data.dms) {
    if (dm.members.findIndex(element => element.uId === user.uId) >= 0) {
      for (const dir of dm.messages) {
        if (dir.message.includes(queryStr)) {
          messages.push(dir);
        }
      }
    }
  }

  //   for (const message of messages) {
  //     for (const react of message.reacts) {
  //       if (react.allUsers.findIndex(element => element.uId === user.uId) >= 0) {
  //         react.allUsers.push(user);
  //       }
  //     }
  //   }

  return { messages: messages };
}
