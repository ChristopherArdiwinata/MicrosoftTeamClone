import { requestAuthRegister, requestClear, requestUserRemove, requestChannelsCreate, requestDmMessages, requestChannelJoin, requestChannelDetails, requestChannelMessages } from '../wrappers';
import { authUserId } from '../interfaces';
import { requestDmCreate, requestDmDetails, requestMessageSend, requestMessageSenddm, requestUserProfileV3, requestuserSetemailV2, requestuserProfileSethandleV2, requestUsersAllV2 } from '../wrappers';
let registered1: authUserId;
let registered2: authUserId;
let registered3: authUserId;
let channelId1: number;
// let channelId2: number;

let dmId: number;

beforeEach(() => {
  requestClear();
  registered1 = requestAuthRegister('duck@gmail.com', 'duck123', 'duck', 'dash');
  registered2 = requestAuthRegister('chick@gmail.com', 'chick123', 'chick', 'mafia');
  registered3 = requestAuthRegister('hound@gmail.com', 'hound123', 'dog', 'drown');
  channelId1 = requestChannelsCreate(registered1.token, 'nest', true).body.channelId;
  requestChannelJoin(registered2.token, channelId1);
  dmId = requestDmCreate(registered2.token, [registered1.authUserId]).dmId;
});

describe('Error Cases', () => {
  test('Invalid token', () => {
    expect(requestUserRemove(registered1.token + registered2.token, registered2.authUserId).statusCode).toStrictEqual(403);
  });
  test('Invalid uId', () => {
    expect(requestUserRemove(registered1.token, registered1.authUserId + registered2.authUserId + registered1.authUserId + registered3.authUserId).statusCode).toStrictEqual(400);
  });
  test('the authorised user is not a global owner', () => {
    expect(requestUserRemove(registered2.token, registered1.authUserId).statusCode).toStrictEqual(403);
  });
  test('the authorised user is the only global owner', () => {
    expect(requestUserRemove(registered1.token, registered1.authUserId).statusCode).toStrictEqual(400);
  });
});
describe('vaild input', () => {
  test('leave the dm', () => {
    expect(requestUserRemove(registered1.token, registered2.authUserId).body).toStrictEqual({});
    expect(requestDmDetails(registered1.token, dmId).body).toStrictEqual({
      name: 'chickmafia, duckdash',
      members: [{
        uId: registered1.authUserId,
        email: 'duck@gmail.com',
        nameFirst: 'duck',
        nameLast: 'dash',
        handleStr: 'duckdash',
      }]
    });
  });
  test('leave the channel ', () => {
    expect(requestUserRemove(registered1.token, registered2.authUserId).body).toStrictEqual({});
    expect(requestChannelDetails(registered1.token, channelId1).body).toStrictEqual({
      name: 'nest',
      isPublic: true,
      ownerMembers: [{
        uId: registered1.authUserId,
        email: 'duck@gmail.com',
        nameFirst: 'duck',
        nameLast: 'dash',
        handleStr: expect.any(String),
      }],
      allMembers: [{
        uId: registered1.authUserId,
        email: 'duck@gmail.com',
        nameFirst: 'duck',
        nameLast: 'dash',
        handleStr: expect.any(String),
      }],
    });
  });
  test('not included in users/all ', () => {
    expect(requestUserRemove(registered1.token, registered2.authUserId).body).toStrictEqual({});
    expect(requestUserRemove(registered1.token, registered3.authUserId).body).toStrictEqual({});
    expect(requestUsersAllV2(registered1.token).body).toStrictEqual({
      users: [
        {
          uId: registered1.authUserId,
          email: 'duck@gmail.com',
          nameFirst: 'duck',
          nameLast: 'dash',
          handleStr: expect.any(String),
          profileImgUrl: expect.any(String)
        }
      ]
    });
  });
  test('message in channel become Removed user ', () => {
    requestMessageSend(registered2.token, channelId1, 'love is love');
    expect(requestUserRemove(registered1.token, registered2.authUserId).body).toStrictEqual({});
    expect(requestChannelMessages(registered1.token, channelId1, 0).body.messages[0].message).toStrictEqual('Removed user');
  });
  test('message in dm become Removed user ', () => {
    requestMessageSenddm(registered1.token, dmId, 'Hi my dogs');
    requestMessageSenddm(registered2.token, dmId, 'I miss you');
    expect(requestUserRemove(registered1.token, registered2.authUserId).body).toStrictEqual({});
    expect(requestDmMessages(registered1.token, dmId, 0).body.messages[0].message).toStrictEqual('Removed user');
  });
  test('Their profile must still be retrievable with user/profile', () => {
    expect(requestUserRemove(registered1.token, registered2.authUserId).body).toStrictEqual({});
    expect(requestUserRemove(registered1.token, registered3.authUserId).body).toStrictEqual({});
    expect(requestUserProfileV3(registered1.token, registered2.authUserId).body).toStrictEqual({
      user: {
        uId: registered2.authUserId,
        email: 'chick@gmail.com',
        nameFirst: 'Removed',
        nameLast: 'user',
        handleStr: expect.any(String),
        profileImgUrl: expect.any(String)
      }
    });
  });
  test('Their handle and email is resuable', () => {
    expect(requestUserRemove(registered1.token, registered2.authUserId).body).toStrictEqual({});
    expect(requestuserSetemailV2(registered1.token, 'chick@gmail.com').body).toStrictEqual({});
    expect(requestuserProfileSethandleV2(registered1.token, 'chickmafia').body).toStrictEqual({});
  });
});
