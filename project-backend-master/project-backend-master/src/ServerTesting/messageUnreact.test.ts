import { requestAuthRegister, requestClear, requestMessageSend, requestChannelsCreate } from '../wrappers';
import { requestChannelMessages, requestMessageReact, requestMessageUnreact, requestDmMessages, requestMessageSenddm, requestDmCreate } from '../wrappers';
import { authUserId } from '../interfaces';

let registered1: authUserId;
let registered2: authUserId;
let registered3: authUserId;
let channelId1: number;
let mIdChannel: number;
let mIdDm: number;
let dmId: number;

afterAll(() => {
  requestClear();
});

describe('Error Cases', () => {
  beforeAll(() => {
    requestClear();
    registered1 = requestAuthRegister('duck@gmail.com', 'duck123', 'duck', 'dash');
    registered2 = requestAuthRegister('chick@gmail.com', 'chick123', 'chick', 'mafia');
    registered3 = requestAuthRegister('hound@gmail.com', 'hound123', 'dog', 'drown');
    channelId1 = requestChannelsCreate(registered1.token, 'nest', true).body.channelId;
    dmId = requestDmCreate(registered2.token, [registered1.authUserId]).dmId;
    mIdChannel = requestMessageSend(registered1.token, channelId1, 'Hi my ducklings').body.messageId;
    mIdDm = requestMessageSenddm(registered1.token, dmId, 'Hi my dogs').body.messageId;
    requestMessageReact(registered1.token, mIdChannel, 1);
    // requestMessageReact(registered1.token, mIdDm, 1);
  });

  test('Invalid token', () => {
    expect(requestMessageUnreact(registered1.token + registered2.token, mIdChannel, 1).statusCode).toStrictEqual(403);
  });
  test('Invalid messageId', () => {
    expect(requestMessageUnreact(registered1.token, mIdChannel * mIdDm + 1, 1).statusCode).toStrictEqual(400);
  });
  test('user is not in channel/dm of messageId', () => {
    expect(requestMessageUnreact(registered3.token, mIdChannel, 1).statusCode).toStrictEqual(400);
  });
  test('Invalid reactId', () => {
    expect(requestMessageUnreact(registered1.token, mIdChannel, 2).statusCode).toStrictEqual(400);
  });
});

describe('Function Testing', () => {
  beforeAll(() => {
    requestClear();
    registered1 = requestAuthRegister('duck@gmail.com', 'duck123', 'duck', 'dash');
    registered2 = requestAuthRegister('chick@gmail.com', 'chick123', 'chick', 'mafia');
    registered3 = requestAuthRegister('hound@gmail.com', 'hound123', 'dog', 'drown');
    channelId1 = requestChannelsCreate(registered1.token, 'nest', true).body.channelId;
    // channelId2 = requestChannelsCreate(registered2.token, 'shed', true).body.channelId;
    dmId = requestDmCreate(registered2.token, [registered1.authUserId]).dmId;
    mIdChannel = requestMessageSend(registered1.token, channelId1, 'Hi my ducklings').body.messageId;
    mIdDm = requestMessageSenddm(registered1.token, dmId, 'Hi my dogs').body.messageId;
    requestMessageReact(registered1.token, mIdChannel, 1);
    requestMessageReact(registered1.token, mIdDm, 1);
  });

  test('Unreacts in channel msg', () => {
    expect(requestMessageUnreact(registered1.token, mIdChannel, 1).body).toStrictEqual({});
    const a = requestChannelMessages(registered1.token, channelId1, 0).body;
    expect(a.messages[0].reacts[0].reactId).toStrictEqual(1);
    expect(a.messages[0].reacts[0].uIds.length).toStrictEqual(0);
  });
  test('Unreacts in dm msg', () => {
    expect(requestMessageUnreact(registered1.token, mIdDm, 1).body).toStrictEqual({});
    const a = requestDmMessages(registered2.token, dmId, 0).body;
    expect(a.messages[0].reacts[0].reactId).toStrictEqual(1);
    expect(a.messages[0].reacts[0].uIds.length).toStrictEqual(0);
  });
});
