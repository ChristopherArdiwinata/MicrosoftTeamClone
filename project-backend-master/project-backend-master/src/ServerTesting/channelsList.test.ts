
import { requestChannelsList, requestChannelsCreate, requestClear, requestAuthRegister } from './../wrappers';
// import { requestChannelInvite, requestChannelJoin } from './../wrappers'

beforeEach(() => {
  requestClear();
});

// test Success cases
describe('channelsListV2 Success Test', () => {
  test('Test 1', () => {
    const authtoken1 = requestAuthRegister('albert.kim@gmail.com', 'albert123', 'Albert', 'Kim').token;
    const channelId = requestChannelsCreate(authtoken1, 'testChannel', true).body.channelId;
    expect(requestChannelsList(authtoken1).body).toEqual({
      channels: [
        {
          channelId: channelId,
          name: 'testChannel',
        }
      ],
    });
  });

  test('Test 2', () => {
    const token1 = requestAuthRegister('albert.kim@gmail.com', 'albert123', 'Albert', 'Kim').token;
    const token2 = requestAuthRegister('john.saul@gmail.com', 'john123', 'John', 'Saul').token;

    requestChannelsCreate(token1, 'testChannel', true);
    expect(requestChannelsList(token2).body).toEqual({
      channels: [],
    });
  });

  test('Test 3', () => {
    const authtoken1 = requestAuthRegister('albert.kim@gmail.com', 'albert123', 'Albert', 'Kim').token;
    const channelId = requestChannelsCreate(authtoken1, 'testChannel', false).body.channelId;
    expect(requestChannelsList(authtoken1).body).toEqual({
      channels: [
        {
          channelId: channelId,
          name: 'testChannel',
        },
      ],
    });
  });

  test('Test 4', () => {
    const authtoken2 = requestAuthRegister('adam.baqaie@gmail.com', 'adam123', 'Adam', 'Baqaie').token;
    const channelId = requestChannelsCreate(authtoken2, 'testChannel', false).body.channelId;
    const channelId2 = requestChannelsCreate(authtoken2, 'testChannel_2', false).body.channelId;
    expect(requestChannelsList(authtoken2).body).toEqual({
      channels: [
        {
          channelId: channelId,
          name: 'testChannel',
        },
        {
          channelId: channelId2,
          name: 'testChannel_2',
        },
      ],
    });
  });

  test('Test 5', () => {
    const authtoken2 = requestAuthRegister('adam.baqaie@gmail.com', 'adam123', 'Adam', 'Baqaie').token;
    const channelId = requestChannelsCreate(authtoken2, 'testChannel', false).body.channelId;
    const channelId2 = requestChannelsCreate(authtoken2, 'testChannel_2', false).body.channelId;
    expect(requestChannelsList(authtoken2).body).toEqual({
      channels: [
        {
          channelId: channelId,
          name: 'testChannel',
        },
        {
          channelId: channelId2,
          name: 'testChannel_2',
        },
      ],
    });
  });
});

// test Error cases
describe('channelsListV2 Error Test', () => {
  test('Test 1: Invalid authtoken', () => {
    const authtoken1 = requestAuthRegister('albert.kim@gmail.com', 'albert123', 'Albert', 'Kim').token;
    const authtoken2 = requestAuthRegister('adam.baqaie@gmail.com', 'adam123', 'Adam', 'Baqaie').token;
    const invalidtoken = authtoken1 + authtoken2;

    expect(requestChannelsList(invalidtoken).statusCode).toBe(403);
    expect(requestChannelsList(invalidtoken).body.error).toEqual({ message: expect.any(String) });
  });
});
