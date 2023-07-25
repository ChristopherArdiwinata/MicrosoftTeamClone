
import { requestAuthRegister, requestPermissionChange, requestClear, requestChannelAddowner, requestChannelsCreate, requestChannelJoin, requestChannelRemoveOwner, requestChanLeavenel } from '../wrappers';
import { authUserId } from '../interfaces';
let registered1: authUserId;
let registered2: authUserId;
let registered3: authUserId;
let channelId1: number;
let channelId2: number;

afterAll(() => {
  requestClear();
});
// This Testing uses eucledian algorithm to assert that
// the inputed auth userId is always unique and non exsisting
beforeAll(() => {
  requestClear();
  registered1 = requestAuthRegister('duck@gmail.com', 'duck123', 'duck', 'dash');
  registered2 = requestAuthRegister('chick@gmail.com', 'chick123', 'chick', 'mafia');
  registered3 = requestAuthRegister('dog@gmail.com', 'doggy123', 'dog', 'drown');
  channelId1 = requestChannelsCreate(registered1.token, 'nest', true).body.channelId;
  channelId2 = requestChannelsCreate(registered2.token, 'shed', true).body.channelId;
});
describe('Error Cases', () => {
  test('Invalid channelId', () => {
    expect(requestChannelAddowner(registered1.token, channelId1 * channelId2 + 1, registered1.authUserId).statusCode).toStrictEqual(400);
  });
  test('Invalid uId', () => {
    expect(requestChannelAddowner(registered1.token, channelId1, registered1.authUserId * registered2.authUserId * registered3.authUserId + 1).statusCode).toStrictEqual(400);
  });
  test('UId is not a member of channel', () => {
    expect(requestChannelAddowner(registered1.token, channelId1, registered2.authUserId).statusCode).toStrictEqual(400);
  });
  test('UId is already an owner', () => {
    expect(requestChannelAddowner(registered1.token, channelId1, registered1.authUserId).statusCode).toStrictEqual(400);
  });
  test('UId does not have owner permissions in the channel', () => {
    // Registered3.token is a member of channelId1->can't addsomeone to owner
    requestChannelJoin(registered3.token, channelId1);
    requestChannelJoin(registered2.token, channelId1);
    expect(requestChannelAddowner(registered3.token, channelId1, registered2.authUserId).statusCode).toStrictEqual(403);
  });
  test('Invalid token', () => {
    expect(requestChannelAddowner(registered1.token + 'p', channelId2, registered1.authUserId).statusCode).toStrictEqual(400);
  });
});

describe('Function Testing', () => {
  beforeEach(() => {
    requestClear();
    registered1 = requestAuthRegister('duck@gmail.com', 'duck123', 'duck', 'dash');
    registered2 = requestAuthRegister('chick@gmail.com', 'chick123', 'chick', 'mafia');
    registered3 = requestAuthRegister('dog@gmail.com', 'doggy123', 'dog', 'drown');
    channelId1 = requestChannelsCreate(registered1.token, 'nest', true).body.channelId;
    channelId2 = requestChannelsCreate(registered2.token, 'shed', true).body.channelId;
  });
  // Every test has a mix of whitebox testing
  test('Add an owner', () => {
    requestChannelJoin(registered2.token, channelId1);
    expect(requestChannelAddowner(registered1.token, channelId1, registered2.authUserId).body).toStrictEqual({});
  });

  test('Add multiple owner in the first channel', () => {
    requestChannelJoin(registered2.token, channelId1);
    requestChannelJoin(registered3.token, channelId1);
    expect(requestChannelAddowner(registered1.token, channelId1, registered2.authUserId).body).toStrictEqual({});
    expect(requestChannelAddowner(registered2.token, channelId1, registered3.authUserId).body).toStrictEqual({});
  });

  test('Checks if new owner has owner permissions in another channel', () => {
    // Makes registered 1,3 as an owner of channelId2
    requestChannelJoin(registered3.token, channelId2);
    expect(requestChannelAddowner(registered2.token, channelId2, registered3.authUserId).body).toStrictEqual({});

    // Test owner permission by adding registered1 to channelId2
    requestChannelJoin(registered1.token, channelId2);
    expect(requestChannelAddowner(registered3.token, channelId2, registered1.authUserId).body).toStrictEqual({});

    // Test if registered 3 has no acces S
    expect(requestChannelAddowner(registered3.token, channelId1, registered2.authUserId).statusCode).toStrictEqual(400);
  });
});

describe('Owner permission test', () => {
  test('global owner(not the channel owner)have the same permission as channel owner', () => {
    requestPermissionChange(registered1.token, registered2.authUserId, 1);
    requestChannelJoin(registered3.token, channelId1);
    requestChannelJoin(registered2.token, channelId1);
    expect(requestChannelAddowner(registered2.token, channelId1, registered3.authUserId).body).toStrictEqual({});
  });
  test('global owner is not in the list of owner', () => {
    requestPermissionChange(registered1.token, registered2.authUserId, 1);
    requestChannelJoin(registered3.token, channelId1);
    requestChannelJoin(registered2.token, channelId1);
    expect(requestChannelRemoveOwner(registered1.token, channelId1, registered2.authUserId).statusCode).toBe(400);
  });
  test('global owner leave the channel and see if he dont have owner permission anymore', () => {
    requestPermissionChange(registered1.token, registered2.authUserId, 1);
    requestChannelJoin(registered3.token, channelId1);
    requestChannelJoin(registered2.token, channelId1);
    expect(requestChannelAddowner(registered2.token, channelId1, registered2.authUserId).body).toStrictEqual({});
    requestChanLeavenel(registered2.token, channelId1);
    expect(requestChanLeavenel(registered2.token, channelId1).statusCode).toStrictEqual(403);
    expect(requestChannelAddowner(registered2.token, channelId1, registered3.authUserId).statusCode).toStrictEqual(400);
  });
});
