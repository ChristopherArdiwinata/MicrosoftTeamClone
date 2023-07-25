import { requestAuthRegister, requestClear, requestChannelsCreate, requestChannelMessages, requestMessageSend } from '../wrappers';
import { messages } from '../interfaces';

const INPUT_ERROR = 400;
const AUTH_ERROR = 403;

describe('Incorrect input', () => {
  let authToken1: string;
  let authToken2: string;
  let authToken3: string;
  let channelId1: number;
  let channelId2: number;
  let channelId3: number;

  beforeAll(() => {
    requestClear();
    authToken1 = requestAuthRegister('gura@gmail.com', '114514810', 'huaizhi', 'li').token;
    authToken2 = requestAuthRegister('Ina@outlook.com', 'asdgf8', 'me', 'vasdui').token;
    authToken3 = requestAuthRegister('ichiru@qq.com', 'asduif8195', 'ichiru', 'shirase').token;

    channelId1 = requestChannelsCreate(authToken1, 'Channel 1', true).body.channelId;
    channelId2 = requestChannelsCreate(authToken2, 'Channel 2', true).body.channelId;
    channelId3 = requestChannelsCreate(authToken3, 'Channel 3', false).body.channelId;
  });
  test('Invalid token', () => {
    // concatenates all token strings together, to guarantee an invalid token
    expect(requestChannelMessages(authToken1 + authToken2 + authToken3, channelId1, 0).statusCode).toBe(AUTH_ERROR);
  });
  test('Start that greater than the total number of messages', () => {
    expect(requestChannelMessages(authToken1, channelId1, 250).statusCode).toBe(INPUT_ERROR);
  });
  test('Invalid channelId', () => {
    expect(requestChannelMessages(authToken1, channelId1 + channelId2 + channelId3, 0).statusCode).toBe(INPUT_ERROR);
  });
  test('ChannelId is valid but the authorised user is not a member of the channel', () => {
    expect(requestChannelMessages(authToken1, channelId2, 0).statusCode).toBe(AUTH_ERROR);
  });
});

describe('Correct input', () => {
  let authToken1: string;
  let authId1: number;
  let authToken2: string;
  let authId2: number;
  let authToken3: string;
  let authId3: number;
  let channelId1: number;
  let channelId2: number;
  let channelId3: number;

  beforeAll(() => {
    requestClear();
    const user1 = requestAuthRegister('gura@gmail.com', '114514810', 'huaizhi', 'li');
    authToken1 = user1.token;
    authId1 = user1.authUserId;
    const user2 = requestAuthRegister('Ina@outlook.com', 'asdgf8', 'me', 'vasdui');
    authToken2 = user2.token;
    authId2 = user2.authUserId;
    const user3 = requestAuthRegister('ichiru@qq.com', 'asduif8195', 'ichiru', 'shirase');
    authToken3 = user3.token;
    authId3 = user3.authUserId;

    channelId1 = requestChannelsCreate(authToken1, 'Channel 1', true).body.channelId;
    channelId2 = requestChannelsCreate(authToken2, 'Channel 2', true).body.channelId;
    channelId3 = requestChannelsCreate(authToken3, 'Channel 3', false).body.channelId;
  });

  test('No messages sent', () => {
    expect(requestChannelMessages(authToken3, channelId3, 0).body).toEqual({
      messages: [],
      start: 0,
      end: -1
    });
  });

  test('Single Message', () => {
    const messageId: number = requestMessageSend(authToken3, channelId3, 'My first message!').body.messageId;
    expect(requestChannelMessages(authToken3, channelId3, 0).body).toEqual({
      messages: [{
        messageId: messageId,
        uId: authId3,
        message: 'My first message!',
        timeSent: expect.any(Number),
        reacts: [{
          reactId: 1,
          uIds: [],
          isThisUserReacted: false
        }],
        isPinned: false
      }],
      start: 0,
      end: -1
    });
  });

  test('Start is not at index 0', () => {
    const messageId1 = requestMessageSend(authToken2, channelId2, 'My first message!').body.messageId;
    const messageId2 = requestMessageSend(authToken2, channelId2, 'My second message!').body.messageId;
    requestMessageSend(authToken2, channelId2, 'My third message!');
    expect(requestChannelMessages(authToken2, channelId2, 1).body).toEqual({
      messages: [{
        messageId: messageId2,
        uId: authId2,
        message: 'My second message!',
        timeSent: expect.any(Number),
        reacts: [{
          reactId: 1,
          uIds: [],
          isThisUserReacted: false
        }],
        isPinned: false
      },
      {
        messageId: messageId1,
        uId: authId2,
        message: 'My first message!',
        timeSent: expect.any(Number),
        reacts: [{
          reactId: 1,
          uIds: [],
          isThisUserReacted: false
        }],
        isPinned: false
      }],
      start: 1,
      end: -1
    });
  });

  test('Over 50 messages', () => {
    // generates 50 messages and pushes to an array: ['0', '1', '2', etc...]
    const messages: messages[] = [];
    for (let i = 0; i < 51; i++) {
      const currentMessage = i.toString();
      const messageId: number = requestMessageSend(authToken1, channelId1, currentMessage).body.messageId;

      messages.push({
        messageId: messageId,
        uId: authId1,
        message: currentMessage,
        timeSent: expect.any(Number),
        reacts: [{
          reactId: 1,
          uIds: []
        }],
        isPinned: false
      });
    }
    const outPut = requestChannelMessages(authToken1, channelId1, 0).body.messages;
    const outPut2 = messages.reverse().slice(0, 50);
    for (let i = 0; i < 50; i++) {
      expect(outPut[i].messageId).toStrictEqual(outPut2[i].messageId);
      expect(outPut[i].uId).toStrictEqual(outPut2[i].uId);
      expect(outPut[i].timeSent).toStrictEqual(outPut2[i].timeSent);
      expect(outPut[i].isPinned).toStrictEqual(outPut2[i].isPinned);
      expect(outPut[i].message).toStrictEqual(outPut2[i].message);
    }
    expect(requestChannelMessages(authToken1, channelId1, 0).body.start).toStrictEqual(0);
    expect(requestChannelMessages(authToken1, channelId1, 0).body.end).toStrictEqual(50);
  });
});
