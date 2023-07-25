import { requestAuthRegister, requestPermissionChange, requestClear, requestChannelsCreate, requestChannelMessages, requestMessageSend, requestDmCreate, requestMessageSenddm, requestChannelJoin, requestMessageEdit, requestDmMessages } from '../wrappers';
const INPUT_ERROR = 400;
const AUTH_ERROR = 403;

describe('Invalid inputs', () => {
  let authToken1: string;
  let authToken2: string;
  let authToken3: string;
  let authId1: number;
  let authId2: number;
  let authId3: number;
  let channelId1: number;
  let messageId1: number;
  let dmId1: number;
  let dmMessageId1: number;

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
    dmId1 = requestDmCreate(authToken1, [authId2, authId3]).dmId;
    dmMessageId1 = requestMessageSenddm(authToken1, dmId1, 'First DM').body.messageId;
  });

  test('New message too long', () => {
    const longString = Array(1002).join('x');
    expect(requestMessageEdit(authToken1, messageId1, longString).statusCode).toBe(INPUT_ERROR);
    expect(requestMessageEdit(authToken1, dmMessageId1, longString).statusCode).toBe(INPUT_ERROR);
  });

  test('Valid authUser but invalid messageId/dmID', () => {
    expect(requestMessageEdit(authToken1, messageId1 + 1, 'My new message').statusCode).toBe(INPUT_ERROR);
    expect(requestMessageEdit(authToken1, dmMessageId1 + 1, 'My new DM').statusCode).toBe(INPUT_ERROR);
  });

  test('AuthUser did not send message and does not have owner permissions', () => {
    expect(requestMessageEdit(authToken2, messageId1, 'My new message').statusCode).toBe(AUTH_ERROR);
    expect(requestMessageEdit(authToken2, dmMessageId1, 'My new DM').statusCode).toBe(AUTH_ERROR);
  });

  test('After changing the permissions, authUser did not send message and does not have owner permissions', () => {
    expect(requestPermissionChange(authToken1, authId2, 1).body).toStrictEqual({});
    expect(requestPermissionChange(authToken2, authId1, 2).body).toStrictEqual({});
    expect(requestMessageEdit(authToken3, messageId1, 'My new message').statusCode).toBe(AUTH_ERROR);
    expect(requestMessageEdit(authToken3, dmMessageId1, 'My new DM').statusCode).toBe(AUTH_ERROR);
  });

  test('AuthUser did not send message but he is global owner', () => {
    expect(requestPermissionChange(authToken1, authId2, 1).body).toStrictEqual({}); // user 2 become global owner
    expect(requestMessageEdit(authToken2, messageId1, 'My new message').statusCode).toBe(200); // user 2 have permission for channel now
    expect(requestMessageEdit(authToken2, dmMessageId1, 'My new DM').statusCode).toBe(AUTH_ERROR); // but user2 doesn't have dm permission
  });

  test('Invalid token', () => {
    const invalidToken = authToken1 + authToken2 + authToken3;
    expect(requestMessageEdit(invalidToken, messageId1, 'My new message').statusCode).toBe(AUTH_ERROR);
    expect(requestMessageEdit(invalidToken, dmMessageId1, 'My new DM').statusCode).toBe(AUTH_ERROR);
  });

  test('Original poster can edit messageDM', () => {
    const dmMessageId2 = requestMessageSenddm(authToken1, dmId1, 'First DM').body.messageId;
    expect(requestMessageEdit(authToken1, dmMessageId2, 'My new DM').body).toStrictEqual({});
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
  let dmMessageId1: number;
  let dmId1: number;

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
    dmId1 = requestDmCreate(authToken1, [authId2, authId3]).dmId;
    dmMessageId1 = requestMessageSenddm(authToken1, dmId1, 'First DM').body.messageId;
  });

  test('New message', () => {
    const newString = 'New String';
    expect(requestMessageEdit(authToken1, messageId1, newString).body).toStrictEqual({});
    expect(requestMessageEdit(authToken1, dmMessageId1, newString).body).toStrictEqual({});
    expect(requestChannelMessages(authToken1, channelId1, 0).body).toEqual({
      messages: [{
        messageId: messageId1,
        uId: authId1,
        message: newString,
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

    expect(requestDmMessages(authToken1, dmId1, 0).body).toEqual({
      messages: [{
        messageId: dmMessageId1,
        uId: authId1,
        message: newString,
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

  test('New message', () => {
    const newString = 'New String';
    expect(requestMessageEdit(authToken1, messageId1, newString).body).toStrictEqual({});
    expect(requestMessageEdit(authToken1, dmMessageId1, newString).body).toStrictEqual({});
    expect(requestChannelMessages(authToken1, channelId1, 0).body).toEqual({
      messages: [{
        messageId: messageId1,
        uId: authId1,
        message: newString,
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

    expect(requestDmMessages(authToken1, dmId1, 0).body).toEqual({
      messages: [{
        messageId: dmMessageId1,
        uId: authId1,
        message: newString,
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
  test('Delete message', () => {
    const newString = '';
    const messageId2 = requestMessageSend(authToken1, channelId1, 'Second message').body.messageId;
    const dmMessageId2 = requestMessageSenddm(authToken2, dmId1, 'Second DM').body.messageId;
    expect(requestMessageEdit(authToken1, messageId1, newString).body).toStrictEqual({});
    expect(requestMessageEdit(authToken1, dmMessageId1, newString).body).toStrictEqual({});
    expect(requestChannelMessages(authToken1, channelId1, 0).body).toEqual({
      messages: [{
        messageId: messageId2,
        uId: authId1,
        message: 'Second message',
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

    expect(requestDmMessages(authToken1, dmId1, 0).body).toEqual({
      messages: [{
        messageId: dmMessageId2,
        uId: authId2,
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
