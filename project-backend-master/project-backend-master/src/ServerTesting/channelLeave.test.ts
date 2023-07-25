
import { requestAuthRegister, requestPermissionChange, requestClear, requestChanLeavenel, requestChannelsCreate, requestChannelJoin } from '../wrappers';
import { requestChannelAddowner, requestStandupStart } from '../wrappers';
import { authUserId } from '../interfaces';
const sleep = require('atomic-sleep');

let registered1: authUserId;
let registered2: authUserId;
let channelId1: number;
let channelId2: number;

afterAll(() => {
  requestClear();
});

beforeAll(() => {
  requestClear();
  registered1 = requestAuthRegister('duck@gmail.com', 'duck123', 'duck', 'dash');
  registered2 = requestAuthRegister('chick@gmail.com', 'chick123', 'chick', 'mafia');
  channelId1 = requestChannelsCreate(registered1.token, 'nest', true).body.channelId;
  channelId2 = requestChannelsCreate(registered2.token, 'shed', true).body.channelId;
});

describe('Error Cases', () => {
  test('Invalid channelId', () => {
    expect(requestChanLeavenel(registered1.token, channelId1 * channelId2 + 1).statusCode).toStrictEqual(400);
  });
  test('User (token) is not a member of channel', () => {
    expect(requestChanLeavenel(registered1.token, channelId2).statusCode).toStrictEqual(403);
  });
  test('Invalid token', () => {
    expect(requestChanLeavenel(registered1.token + registered1.token + 'p', channelId1).statusCode).toStrictEqual(400);
  });
  
  test('Standup is active and user created standup', () => {
    requestStandupStart(registered1.token, channelId1, 1);
    expect(requestChanLeavenel(registered1.token, channelId1).statusCode).toStrictEqual(400);
    sleep(1000);
  });
});


describe('Function Testing', () => {
  test('Member leaving', () => {
    requestChannelJoin(registered2.token, channelId1);
    expect(requestChanLeavenel(registered2.token, channelId1).body).toStrictEqual({});
    expect(requestChanLeavenel(registered2.token, channelId1).statusCode).toStrictEqual(403);
  });
  test('Owner leaves', () => {
    expect(requestChanLeavenel(registered1.token, channelId1).body).toStrictEqual({});
    expect(requestChanLeavenel(registered1.token, channelId1).statusCode).toStrictEqual(403);
    requestChannelJoin(registered1.token, channelId1);
    requestChannelJoin(registered2.token, channelId1);
    // Check if owner Id is removed when leaving the channel
    requestPermissionChange(registered1.token, registered2.authUserId, 1);
    requestPermissionChange(registered2.token, registered1.authUserId, 2);
    // now in this channel, user1(not global owner)is the only owner, user2 is global owner but not channel owner
    expect(requestChannelAddowner(registered1.token, channelId1, registered2.authUserId).statusCode).toStrictEqual(403);
  });
  test('Owner leaves (not original owner)', () => {
    requestClear();
    registered1 = requestAuthRegister('duck@gmail.com', 'duck123', 'duck', 'dash');
    registered2 = requestAuthRegister('chick@gmail.com', 'chick123', 'chick', 'mafia');
    channelId1 = requestChannelsCreate(registered1.token, 'nest', true).body.channelId;
    channelId2 = requestChannelsCreate(registered2.token, 'shed', true).body.channelId;
    requestChannelJoin(registered2.token, channelId1);
    expect(requestChannelAddowner(registered1.token, channelId1, registered2.authUserId).body).toStrictEqual({});
    expect(requestChanLeavenel(registered2.token, channelId1).body).toStrictEqual({});
    expect(requestChannelAddowner(registered1.token, channelId1, registered2.authUserId).statusCode).toStrictEqual(400);
  });
});
