import { requestAuthRegister, requestClear, requestMessageSend, requestChannelsCreate, requestChannelJoin } from '../wrappers';
import { requestChannelMessages, requestPermissionChange, requestMessagePin, requestMessageUnpin, requestMessageSenddm, requestDmCreate, requestDmMessages } from '../wrappers';
import { authUserId } from '../interfaces';
let registered1: authUserId;
let registered2: authUserId;
let registered3: authUserId;
let channelId1: number;
let channelId2: number;
let mIdChannel: number;
let mIdDm: number;
let dmId: number;
afterAll(() => {
  requestClear();
});

describe('Error Cases and Function Testing', () => {
  beforeAll(() => {
    requestClear();
    registered1 = requestAuthRegister('duck@gmail.com', 'duck123', 'duck', 'dash');
    registered2 = requestAuthRegister('chick@gmail.com', 'chick123', 'chick', 'mafia');
    registered3 = requestAuthRegister('dog@gmail.com', 'hound123', 'dog', 'drown');
    channelId1 = requestChannelsCreate(registered1.token, 'nest', true).body.channelId;
    channelId2 = requestChannelsCreate(registered2.token, 'shed', true).body.channelId;
    dmId = requestDmCreate(registered2.token, [registered1.authUserId]).dmId;
    mIdChannel = requestMessageSend(registered1.token, channelId1, 'Hi my ducklings').body.messageId;
    mIdDm = requestMessageSenddm(registered1.token, dmId, 'Hi my dogs').body.messageId;
    requestMessagePin(registered2.token, mIdDm);
    requestMessagePin(registered1.token, mIdChannel);
  });
  test('Invalid messageId', () => {
    expect(requestMessageUnpin(registered1.token, mIdChannel * mIdDm + 1).statusCode).toStrictEqual(400);
  });
  test('(Channel) user is not in messageId', () => {
    expect(requestMessageUnpin(registered3.token, mIdChannel).statusCode).toStrictEqual(403);
  });
  test('(DM) user is not in messageId', () => {
    expect(requestMessageUnpin(registered3.token, mIdDm).statusCode).toStrictEqual(400);
  });
  test('Global owner can unPin', () => {
    const mIdChannel2 = requestMessageSend(registered2.token, channelId2, 'How to become a dog').body.messageId;
    requestMessagePin(registered2.token, mIdChannel2);
    requestChannelJoin(registered1.token, channelId2);
    expect(requestMessageUnpin(registered1.token, mIdChannel2).body).toStrictEqual({});
  });
  test('Global owner can unPin, even if some permission changes happened', () => {
    const mIdChannel2 = requestMessageSend(registered2.token, channelId2, 'How to become a dog').body.messageId;
    expect(requestPermissionChange(registered1.token, registered3.authUserId, 1).body).toStrictEqual({});
    requestMessagePin(registered2.token, mIdChannel2);
    requestChannelJoin(registered3.token, channelId2);
    expect(requestMessageUnpin(registered3.token, mIdChannel2).body).toStrictEqual({});
  });
  test('(Channel) Message is not pinned ', () => {
    expect(requestMessageUnpin(registered1.token, mIdChannel).body).toStrictEqual({});
    expect(requestMessageUnpin(registered1.token, mIdChannel).statusCode).toStrictEqual(400);
    const a = requestChannelMessages(registered1.token, channelId1, 0).body;
    expect(a.messages[0].isPinned).toStrictEqual(false);
  });
  test('(DM) Message is not pinned ', () => {
    expect(requestMessageUnpin(registered2.token, mIdDm).body).toStrictEqual({});
    expect(requestMessageUnpin(registered2.token, mIdDm).statusCode).toStrictEqual(400);
    const a = requestDmMessages(registered2.token, dmId, 0).body;
    expect(a.messages[0].isPinned).toStrictEqual(false);
  });
});

describe('Error Cases and Function Testing', () => {
  beforeAll(() => {
    requestClear();
    registered1 = requestAuthRegister('duck@gmail.com', 'duck123', 'duck', 'dash');
    registered2 = requestAuthRegister('chick@gmail.com', 'chick123', 'chick', 'mafia');
    registered3 = requestAuthRegister('dog@gmail.com', 'hound123', 'dog', 'drown');
    channelId1 = requestChannelsCreate(registered1.token, 'nest', true).body.channelId;
    channelId2 = requestChannelsCreate(registered2.token, 'shed', true).body.channelId;
    dmId = requestDmCreate(registered2.token, [registered1.authUserId]).dmId;
    mIdChannel = requestMessageSend(registered1.token, channelId1, 'Hi my ducklings').body.messageId;
    mIdDm = requestMessageSenddm(registered1.token, dmId, 'Hi my dogs').body.messageId;
    requestMessagePin(registered2.token, mIdDm);
    requestMessagePin(registered1.token, mIdChannel);
  });
  test('(Channel) User does not have owner permission ', () => {
    requestChannelJoin(registered2.token, channelId1);
    expect(requestMessageUnpin(registered2.token, mIdChannel).statusCode).toStrictEqual(403);
  });
  test('(DM) User does not have owner permission', () => {
    expect(requestMessageUnpin(registered1.token, mIdDm).statusCode).toStrictEqual(403);
  });
});
