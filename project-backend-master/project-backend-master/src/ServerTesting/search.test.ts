import { requestAuthRegister, requestClear, requestMessageSend, requestChannelsCreate, requestDmCreate, requestSearch, requestMessageSenddm } from '../wrappers';
import { authUserId } from '../interfaces';

const ERROR = { message: expect.any(String) };

let registered1: authUserId;
let registered2: authUserId;
let registered3: authUserId;
let channelId1: number;
let channelId2: number;
let channelId3: number;
let dmId1: number;
let dmId2: number;
let dmId3: number;

beforeEach(() => {
  requestClear();
  registered1 = requestAuthRegister('duck@gmail.com', 'duck123', 'duck', 'dash');
  registered2 = requestAuthRegister('chick@gmail.com', 'chick123', 'chick', 'mafia');
  registered3 = requestAuthRegister('wolf@gmail.com', 'wolf123', 'wolf', 'running');
  channelId1 = requestChannelsCreate(registered1.token, 'nest', true).body.channelId;
  channelId2 = requestChannelsCreate(registered2.token, 'shed', true).body.channelId;
  channelId3 = requestChannelsCreate(registered3.token, 'shed', true).body.channelId;
  dmId1 = requestDmCreate(registered1.token, [registered2.authUserId, registered3.authUserId]).dmId;
  dmId2 = requestDmCreate(registered1.token, [registered2.authUserId, registered3.authUserId]).dmId;
  dmId3 = requestDmCreate(registered1.token, [registered2.authUserId, registered3.authUserId]).dmId;
});
describe('Error Cases', () => {
  test('Message must be between 1 to 1000 letters', () => {
    expect(requestSearch(registered1.token, '').statusCode).toBe(400);
    expect(requestSearch(registered1.token, '').body.error).toStrictEqual(ERROR);
  });

  test('Message must be between 1 to 1000 letters', () => {
    let fullChar = '';
    for (let i = 0; i < 1001; i++) {
      fullChar += 'p';
    }
    expect(requestSearch(registered1.token, fullChar).statusCode).toBe(400);
    expect(requestSearch(registered1.token, fullChar).body.error).toStrictEqual(ERROR);
  });

  test('Invalid token', () => {
    expect(requestSearch(registered1.token + registered2.token + 'popo', 'rabbit').statusCode).toBe(403);
    expect(requestSearch(registered1.token + registered2.token + 'popo', 'rabbit').body.error).toStrictEqual(ERROR);
  });
});

describe('Function Testing', () => {
  test('Find 2 "rabbit" of 3 messages in 1 dm', () => {
    requestMessageSenddm(registered1.token, dmId1, 'rabbit');
    requestMessageSenddm(registered1.token, dmId1, 'hello rabbit hello');
    requestMessageSenddm(registered1.token, dmId1, 'hello hello hello');
    expect(requestSearch(registered1.token, 'rabbit').body).toStrictEqual({
      messages: [
        {
          messageId: expect.any(Number),
          uId: registered1.authUserId,
          message: expect.any(String),
          timeSent: expect.any(Number),
          reacts: [{
            reactId: 1,
            uIds: []
          }],
          isPinned: false
        },
        {
          messageId: expect.any(Number),
          uId: registered1.authUserId,
          message: expect.any(String),
          timeSent: expect.any(Number),
          reacts: [{
            reactId: 1,
            uIds: []
          }],
          isPinned: false
        }]
    });
  });

  test('Find 1 "rabbit" of 3 messages in 1 channel', () => {
    requestMessageSend(registered1.token, channelId1, 'asldj laksjd lkas ');
    requestMessageSend(registered1.token, channelId1, 'hello he9 hell rabbito');
    requestMessageSend(registered1.token, channelId1, 'hello hello hello');
    expect(requestSearch(registered1.token, 'rabbit').body).toStrictEqual({
      messages: [
        {
          messageId: expect.any(Number),
          uId: registered1.authUserId,
          message: expect.any(String),
          timeSent: expect.any(Number),
          reacts: [{
            reactId: 1,
            uIds: []
          }],
          isPinned: false
        }
      ]
    });
  });

  test('find 3 "rabbit" of 8 messages in different channels and dms', () => {
    requestMessageSenddm(registered1.token, dmId1, 'asldj laksjd lkas ');
    requestMessageSenddm(registered1.token, dmId2, 'hello he9 hell rabbito');
    requestMessageSenddm(registered1.token, dmId3, 'hello hello hello');
    requestMessageSenddm(registered1.token, dmId3, 'hellorabbit hello hello');

    requestMessageSend(registered1.token, channelId1, 'potato');
    requestMessageSend(registered1.token, channelId1, 'potatorabbit');
    requestMessageSend(registered2.token, channelId2, 'potato');
    requestMessageSend(registered3.token, channelId3, 'potatorabbit');

    expect(requestSearch(registered1.token, 'rabbit').body).toStrictEqual({
      messages: [
        {
          messageId: expect.any(Number),
          uId: registered1.authUserId,
          message: expect.any(String),
          timeSent: expect.any(Number),
          reacts: [{
            reactId: 1,
            uIds: []
          }],
          isPinned: false
        },
        {
          messageId: expect.any(Number),
          uId: registered1.authUserId,
          message: expect.any(String),
          timeSent: expect.any(Number),
          reacts: [{
            reactId: 1,
            uIds: []
          }],
          isPinned: false
        },
        {
          messageId: expect.any(Number),
          uId: registered1.authUserId,
          message: expect.any(String),
          timeSent: expect.any(Number),
          reacts: [{
            reactId: 1,
            uIds: []
          }],
          isPinned: false
        }]
    });
  });
});
