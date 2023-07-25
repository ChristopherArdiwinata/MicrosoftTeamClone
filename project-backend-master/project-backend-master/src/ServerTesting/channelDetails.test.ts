
import { requestAuthRegister, requestClear, requestChannelsCreate, requestChannelJoin, requestChannelInvite, requestChannelDetails } from '../wrappers';
import { authUserId } from '../interfaces';

let registered1: authUserId;
let channelId1: number;

afterAll(() => {
  requestClear();
});

describe('Error cases', () => {
  beforeAll(() => {
    requestClear();
    registered1 = requestAuthRegister('duck@gmail.com', 'duck123', 'duck', 'dash');
    channelId1 = requestChannelsCreate(registered1.token, 'first', true).body.channelId;
  });
  test('Test for Invalid authUserId', () => {
    expect(requestChannelDetails(registered1.token + 'p', channelId1).statusCode).toStrictEqual(400);
  });
  test('Test for Invalid courseId', () => {
    expect(requestChannelDetails(registered1.token, channelId1 + 1).statusCode).toStrictEqual(400);
  });
  test('Test for not a member', () => {
    const registered2 = requestAuthRegister('dog@gmail.com', 'hound123', 'dog', 'drown');
    expect(requestChannelDetails(registered2.token, channelId1).statusCode).toStrictEqual(403);
  });
});

describe('Function Testing', () => {
  beforeEach(() => {
    requestClear();
    registered1 = requestAuthRegister('duck@gmail.com', 'duck123', 'duck', 'dash');
    channelId1 = requestChannelsCreate(registered1.token, 'first', true).body.channelId;
  });
  test('In public courseId ', () => {
    expect(requestChannelDetails(registered1.token, channelId1).body).toStrictEqual({
      name: 'first',
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
  test('non-public courseId', () => {
    const channelIdPrivate = requestChannelsCreate(registered1.token, 'third', false).body.channelId;
    expect(requestChannelDetails(registered1.token, channelIdPrivate).body).toStrictEqual({
      name: 'third',
      isPublic: false,
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

  test('Public courseId', () => {
    const registered2 = requestAuthRegister('dog@gmail.com', 'hound123', 'dog', 'drown');
    const registered3 = requestAuthRegister('donkey@gmail.com', '123456', 'donkey', 'fly');
    requestChannelJoin(registered2.token, channelId1);
    requestChannelDetails(registered1.token, channelId1);
    expect(requestChannelDetails(registered1.token, channelId1).body).toStrictEqual({
      name: 'first',
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
      },
      {
        uId: registered2.authUserId,
        email: 'dog@gmail.com',
        nameFirst: 'dog',
        nameLast: 'drown',
        handleStr: expect.any(String),
      }],
    });
    requestChannelJoin(registered3.token, channelId1);
    expect(requestChannelDetails(registered1.token, channelId1).body).toStrictEqual({
      name: 'first',
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
      },
      {
        uId: registered2.authUserId,
        email: 'dog@gmail.com',
        nameFirst: 'dog',
        nameLast: 'drown',
        handleStr: expect.any(String),
      },
      {
        uId: registered3.authUserId,
        email: 'donkey@gmail.com',
        nameFirst: 'donkey',
        nameLast: 'fly',
        handleStr: expect.any(String),
      }],
    });
  });

  test('Public courseId use ChannelInv', () => {
    const registered2 = requestAuthRegister('dog@gmail.com', 'hound123', 'dog', 'drown');
    const channelIdPrivate = requestChannelsCreate(registered1.token, 'third', false).body.channelId;
    requestChannelInvite(registered1.token, channelId1, registered2.authUserId);
    expect(requestChannelDetails(registered1.token, channelId1).body).toStrictEqual({
      name: 'first',
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
      },
      {
        uId: registered2.authUserId,
        email: 'dog@gmail.com',
        nameFirst: 'dog',
        nameLast: 'drown',
        handleStr: expect.any(String),
      }],
    });
    requestChannelInvite(registered1.token, channelIdPrivate, registered2.authUserId);
    expect(requestChannelDetails(registered1.token, channelIdPrivate).body).toStrictEqual({
      name: 'third',
      isPublic: false,
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
      },
      {
        uId: registered2.authUserId,
        email: 'dog@gmail.com',
        nameFirst: 'dog',
        nameLast: 'drown',
        handleStr: expect.any(String),
      }]
    });
  });
});
