import { requestAuthRegister, requestClear, requestChannelsCreate, requestChannelMessages, requestMessageSend, requestDmCreate, requestMessageSenddm, requestChannelJoin, requestMessageRemove, requestDmMessages } from '../wrappers';

const INPUT_ERROR = 400;
const AUTH_ERROR = 403;

describe('Invalid inputs', () => {
  let authToken1: string;
  let authToken2: string;
  let authToken3: string;
  let authId2: number;
  let authId3: number;
  let channelId1: number;
  let messageId1: number;
  let messageId2: number;
  let messageId3: number;
  let dmId1: number;
  let dmMessageId1: number;

  beforeEach(() => {
    requestClear();
    const user1 = requestAuthRegister('anna@gmail.com', 'aaa123', 'Anna', 'Albert');
    authToken1 = user1.token;

    const user2 = requestAuthRegister('bob@outlook.com', 'bbb123', 'Bob', 'Billington');
    authToken2 = user2.token;
    authId2 = user2.authUserId;

    const user3 = requestAuthRegister('claire@gmail.com', 'ccc123', 'Claire', 'Cucumber');
    authToken3 = user3.token;
    authId3 = user3.authUserId;

    channelId1 = requestChannelsCreate(authToken1, 'Channel 1', true).body.channelId;
    requestChannelJoin(authToken2, channelId1);
    requestChannelJoin(authToken3, channelId1);
    messageId1 = requestMessageSend(authToken1, channelId1, 'First message').body.messageId;
    messageId2 = requestMessageSend(authToken2, channelId1, 'Second message').body.messageId;
    messageId3 = requestMessageSend(authToken1, channelId1, 'Third message').body.messageId;
    dmId1 = requestDmCreate(authToken1, [authId2, authId3]).dmId;
    dmMessageId1 = requestMessageSenddm(authToken1, dmId1, 'First DM').body.messageId;
  });

  test('Valid authUser but invalid messageId/dmID', () => {
    expect(requestMessageRemove(authToken1, messageId1 ** 2 + messageId2 ** 2 + messageId3 ** 2).statusCode).toBe(INPUT_ERROR);
    expect(requestMessageRemove(authToken1, dmId1 + 1).statusCode).toBe(INPUT_ERROR);
  });

  test('AuthUser did not send message and does not have owner permissions', () => {
    expect(requestMessageRemove(authToken2, messageId1).statusCode).toBe(AUTH_ERROR);
    expect(requestMessageRemove(authToken2, dmMessageId1).statusCode).toBe(AUTH_ERROR);
  });

  test('Invalid token', () => {
    const invalidToken = authToken1 + authToken2 + authToken3;
    expect(requestMessageRemove(invalidToken, messageId1).statusCode).toBe(AUTH_ERROR);
    expect(requestMessageRemove(invalidToken, dmId1).statusCode).toBe(AUTH_ERROR);
  });

  test('Global owner cannot remove member message DM', () => {
    const dmId2 = requestDmCreate(authToken2, [1, authId3]).dmId;
    const dmMessageId2 = requestMessageSenddm(authToken2, dmId2, 'First DM').body.messageId;
    expect(requestMessageRemove(authToken1, dmMessageId2).statusCode).toBe(AUTH_ERROR);
  });
  
});

describe('Valid inputs', () => {
  let authToken1: string;
  let authToken2: string;
  let authToken3: string;
  let authId1: number;
  let authId2: number;
  let authId3: number;
  let channelId1: number;
  let messageId1: number;
  let messageId2: number;
  let messageId3: number;
  let dmId1: number;
  let dmMessageId1: number;
  let dmMessageId2: number;

  beforeEach(() => {
    requestClear();
    const user1 = requestAuthRegister('anna@gmail.com', 'aaa123', 'Anna', 'Albert');
    authToken1 = user1.token;
    authId1 = user1.authUserId;

    const user2 = requestAuthRegister('bob@outlook.com', 'bbb123', 'Bob', 'Billington');
    authToken2 = user2.token;
    authId2 = user2.authUserId;

    const user3 = requestAuthRegister('claire@gmail.com', 'ccc123', 'Claire', 'Cucumber');
    authToken3 = user3.token;
    authId3 = user3.authUserId;

    channelId1 = requestChannelsCreate(authToken1, 'Channel 1', true).body.channelId;
    requestChannelJoin(authToken2, channelId1);
    requestChannelJoin(authToken3, channelId1);
    messageId1 = requestMessageSend(authToken1, channelId1, 'First message').body.messageId;
    messageId2 = requestMessageSend(authToken2, channelId1, 'Second message').body.messageId;
    messageId3 = requestMessageSend(authToken1, channelId1, 'Third message').body.messageId;
    dmId1 = requestDmCreate(authToken1, [authId2, authId3]).dmId;
    dmMessageId1 = requestMessageSenddm(authToken1, dmId1, 'First DM').body.messageId;
    dmMessageId2 = requestMessageSenddm(authToken1, dmId1, 'Second DM').body.messageId;
  });

  test('Remove channel message', () => {
    expect(requestMessageRemove(authToken1, messageId2).body).toStrictEqual({});
    expect(requestChannelMessages(authToken1, channelId1, 0).body).toEqual({
      messages: [{
        messageId: messageId3,
        uId: authId1,
        message: 'Third message',
        timeSent: expect.any(Number),
        reacts: [{
          reactId: expect.any(Number),
          uIds: [],
          isThisUserReacted: false
        }],
        isPinned: false
      },
      {
        messageId: messageId1,
        uId: authId1,
        message: 'First message',
        timeSent: expect.any(Number),
        reacts: [{
          reactId: expect.any(Number),
          uIds: [],
          isThisUserReacted: false,
        }],
        isPinned: false
      }],
      start: 0,
      end: -1
    });
  });

  test('Remove DM message', () => {
    expect(requestMessageRemove(authToken1, dmMessageId1).body).toStrictEqual({});
    expect(requestDmMessages(authToken1, dmId1, 0).body).toEqual(
      {
        messages: [{
          messageId: dmMessageId2,
          uId: authId1,
          message: 'Second DM',
          timeSent: expect.any(Number),
          reacts: [{
            reactId: expect.any(Number),
            uIds: [],
            isThisUserReacted: false
          }],
          isPinned: false
        }],
        start: 0,
        end: -1
      });
  });
});