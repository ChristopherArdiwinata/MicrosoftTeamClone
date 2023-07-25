import { requestClear, requestAuthRegister, requestChannelsCreate, requestStandupStart, requestStandupSend, requestChannelJoin, requestChannelMessages } from '../wrappers';
const sleep = require('atomic-sleep');

const INPUT_ERROR = 400;
const AUTH_ERROR = 403;
const OK = 200;

describe('Miscallaneous errors', () => {
  let authToken1: string;
  let authToken2: string;
  let authToken3: string;
  let channelId1: number;

  beforeEach(() => {
    requestClear();
    authToken1 = requestAuthRegister('anna@gmail.com', 'aaa123', 'Anna', 'Adams').token;
    authToken2 = requestAuthRegister('bob@outlook.com', 'bbb123', 'Bob', 'Biggums').token;
    authToken3 = requestAuthRegister('chris@outlook.com', 'ccc123', 'Chris', 'Catman').token;

    channelId1 = requestChannelsCreate(authToken2, 'Channel 1', true).body.channelId;
    requestChannelJoin(authToken3, channelId1);
  });

  test('Errors', () => {
    // Invalid token
    requestStandupStart(authToken2, channelId1, 1);
    expect(requestStandupSend(authToken1 + authToken2 + authToken3, channelId1, 'test').statusCode).toBe(AUTH_ERROR);

    // Invalid channelId
    requestStandupStart(authToken2, channelId1, 1);
    expect(requestStandupSend(authToken3, channelId1 + 1, 'test').statusCode).toBe(INPUT_ERROR);

    // Valid channelId but user is not member
    requestStandupStart(authToken2, channelId1, 1);
    expect(requestStandupSend(authToken1, channelId1, 'test').statusCode).toBe(AUTH_ERROR);

    // Message over 1000 characters
    const longString = Array(1002).join('x');
    requestStandupStart(authToken2, channelId1, 1);
    expect(requestStandupSend(authToken3, channelId1, longString).statusCode).toBe(INPUT_ERROR);
    sleep(1000);
  });

  test('No standup is active', () => {
    expect(requestStandupSend(authToken2, channelId1, 'test').statusCode).toBe(INPUT_ERROR);
  });
});
describe('Valid operation', () => {
  test('send messages', () => {
    requestClear();
    const user1 = requestAuthRegister('anna@gmail.com', 'aaa123', 'Anna', 'Adams');
    const authId1 = user1.authUserId;
    const authToken1 = user1.token;
    const authToken2 = requestAuthRegister('bob@outlook.com', 'bbb123', 'Bob', 'Biggums').token;

    const channelId1 = requestChannelsCreate(authToken2, 'Channel 1', true).body.channelId;
    requestChannelJoin(authToken1, channelId1);

    requestStandupStart(authToken1, channelId1, 1);
    expect(requestStandupSend(authToken1, channelId1, 'First').statusCode).toBe(OK);
    expect(requestStandupSend(authToken2, channelId1, 'Second').statusCode).toBe(OK);

    // user cannot send message to standup after it is finished
    sleep(1000);
    expect(requestStandupSend(authToken1, channelId1, 'Third').statusCode).toBe(INPUT_ERROR);

    expect(requestChannelMessages(authToken2, channelId1, 0).body).toStrictEqual({
      messages: [{
        messageId: expect.any(Number),
        uId: authId1,
        message: 'annaadams: First\nbobbiggums: Second',
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
});
