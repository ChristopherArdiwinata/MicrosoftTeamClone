import { requestAuthRegister, requestClear, requestMessageSend, requestChannelsCreate } from '../wrappers';
import { requestChannelMessages, requestMessageShare, requestMessageSenddm, requestDmCreate, requestDmMessages } from '../wrappers';
import { authUserId } from '../interfaces';
// import { authRegisterV3 } from '../auth';
// import { channelsCreateV3 } from '../channels';
// import { channelId } from '../interfaces';
// import { dmCreateV2 } from '../dm';
// import { messageSendV2 } from '../message';
// import { messageSenddmV2 } from '../message';
let registered1: authUserId;
let registered2: authUserId;
let registered3: authUserId;
let channelId1: number;
let channelId2: number;
let mIdChannel: number;
let mIdDm: number;
let dmId: number;

const message = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit';
let longMessage = 'Lorem ipsum';

for (let i = 0; i < 1001; i++) {
  longMessage += 'p';
}
afterAll(() => {
  requestClear();
});

describe('Error Cases', () => {
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
  });
  // ogMessageId = either mIdChannel or mIdDm
  test('(ChannelId) Invalid channelId and dmId', () => {
    expect(requestMessageShare(registered1.token, mIdChannel, message, channelId1 * channelId2 + 1, -1).statusCode).toStrictEqual(400);
  });
  test('(DmId) Invalid channelId and dmId', () => {
    expect(requestMessageShare(registered1.token, mIdChannel, message, -1, dmId + 1).statusCode).toStrictEqual(400);
  });
  test('neither channelId nor dmId are -1', () => {
    expect(requestMessageShare(registered1.token, mIdChannel, message, channelId1, dmId).statusCode).toStrictEqual(400);
  });
  test('Invalid ogMessageId', () => {
    expect(requestMessageShare(registered1.token, mIdChannel * mIdDm * dmId + 1, message, channelId1, -1).statusCode).toStrictEqual(400);
  });
  test('Length of message musts be <= 1000', () => {
    expect(requestMessageShare(registered1.token, mIdChannel, longMessage, channelId1, -1).statusCode).toStrictEqual(400);
  });
  test('(Channel) User is not in channelId', () => {
    expect(requestMessageShare(registered2.token, mIdChannel, message, channelId1, -1).statusCode).toStrictEqual(403);
  });
  test('(DM) User is not in DmId', () => {
    expect(requestMessageShare(registered3.token, mIdDm, message, -1, dmId).statusCode).toStrictEqual(403);
  });
});

describe('Function Testing', () => {
  beforeAll(() => {
    requestClear();
    registered1 = requestAuthRegister('duck@gmail.com', 'duck123', 'duck', 'dash');
    registered2 = requestAuthRegister('chick@gmail.com', 'chick123', 'chick', 'mafia');
    channelId1 = requestChannelsCreate(registered1.token, 'nest', true).body.channelId;
    dmId = requestDmCreate(registered2.token, [registered1.authUserId]).dmId;
    mIdChannel = requestMessageSend(registered1.token, channelId1, 'Hi my ducklings').body.messageId;
    mIdDm = requestMessageSenddm(registered1.token, dmId, 'Hi my dogs').body.messageId;
  });
  // ogMessageId = in bracket
  test('Shared to Channel (dm)', () => {
    expect(requestMessageShare(registered1.token, mIdDm, message, channelId1, -1).body).toStrictEqual({ sharedMessageId: expect.any(Number) });
    const a = requestChannelMessages(registered1.token, channelId1, 0).body;
    expect(a.messages[0].message).toContain(message);
    expect(a.messages[0].message).toContain('Hi my dogs');
  });
  test('Shared to Dm (channel)', () => {
    expect(requestMessageShare(registered2.token, mIdChannel, message, -1, dmId).body).toStrictEqual({ sharedMessageId: expect.any(Number) });
    const a = requestDmMessages(registered2.token, dmId, 0).body;
    expect(a.messages[0].message).toContain(message);
    expect(a.messages[0].message).toContain('Hi my ducklings');
  });
});
