
import { requestChannelsListAll, requestAuthRegister, requestChannelsCreate, requestClear } from './../wrappers';

const ERROR = { message: expect.any(String) };

describe('test requestChannelsListAll', () => {
  beforeEach(() => {
    requestClear();
  });

  test('Test for Invalid user ID', () => {
    const token = requestAuthRegister('duck@gmail.com', '123456', 'duck', 'dash').token;
    expect(requestChannelsListAll(token + 1).statusCode).toBe(403);
    expect(requestChannelsListAll(token + 1).body.error).toStrictEqual(ERROR);
  });

  test('Test for valid user ID', () => {
    const token = requestAuthRegister('duck@gmail.com', '123456', 'duck', 'dash').token;
    expect(requestChannelsListAll(token).body).toStrictEqual({ channels: [] });
  });

  test('Test return value after creating multiple Public channels', () => {
    const token = requestAuthRegister('duck@gmail.com', '123456', 'duck', 'dash').token;
    const firstId = requestChannelsCreate(token, 'first', true).body.channelId;
    const secondId = requestChannelsCreate(token, 'second', true).body.channelId;
    const thirdId = requestChannelsCreate(token, 'third', true).body.channelId;
    expect(requestChannelsListAll(token).body).toStrictEqual({
      channels: [
        {
          channelId: firstId,
          name: 'first',
        },
        {
          channelId: secondId,
          name: 'second',
        },
        {
          channelId: thirdId,
          name: 'third',
        },
      ],
    });
  });

  test('Test return value after creating multiple Non Public channels', () => {
    const token = requestAuthRegister('duck@gmail.com', '123456', 'duck', 'dash').token;
    const firstId = requestChannelsCreate(token, 'first', false).body.channelId;
    const secondId = requestChannelsCreate(token, 'second', false).body.channelId;
    const thirdId = requestChannelsCreate(token, 'third', false).body.channelId;
    expect(requestChannelsListAll(token).body).toStrictEqual({
      channels: [
        {
          channelId: firstId,
          name: 'first',
        },
        {
          channelId: secondId,
          name: 'second',
        },
        {
          channelId: thirdId,
          name: 'third',
        },
      ],
    });
  });
  test('Test return value after creating multiple mix public channels', () => {
    const token = requestAuthRegister('duck@gmail.com', '123456', 'duck', 'dash').token;
    const firstId = requestChannelsCreate(token, 'first', false).body.channelId;
    const secondId = requestChannelsCreate(token, 'second', true).body.channelId;
    const thirdId = requestChannelsCreate(token, 'third', false).body.channelId;
    expect(requestChannelsListAll(token).body).toStrictEqual({
      channels: [
        {
          channelId: firstId,
          name: 'first',
        },
        {
          channelId: secondId,
          name: 'second',
        },
        {
          channelId: thirdId,
          name: 'third',
        },
      ],
    });
  });
  test('test output with channel inv ', () => {
    const token = requestAuthRegister('duck@gmail.com', '123456', 'duck', 'dash').token;
    const firstId = requestChannelsCreate(token, 'first', false).body.channelId;
    const secondId = requestChannelsCreate(token, 'second', true).body.channelId;
    const thirdId = requestChannelsCreate(token, 'third', false).body.channelId;
    expect(requestChannelsListAll(token).body).toStrictEqual({
      channels: [
        {
          channelId: firstId,
          name: 'first',
        },
        {
          channelId: secondId,
          name: 'second',
        },
        {
          channelId: thirdId,
          name: 'third',
        },
      ],
    });
  });
  test('test output with channel inv and channelJoin', () => {
    const token = requestAuthRegister('duck@gmail.com', '123456', 'duck', 'dash').token;
    const token2 = requestAuthRegister('dog@gmail.com', '123456', 'dog', 'drown').token;
    const firstId = requestChannelsCreate(token, 'first', false).body.channelId;
    const secondId = requestChannelsCreate(token, 'second', true).body.channelId;
    const thirdId = requestChannelsCreate(token, 'third', true).body.channelId;
    expect(requestChannelsListAll(token2).body).toStrictEqual({
      channels: [
        {
          channelId: firstId,
          name: 'first',
        },
        {
          channelId: secondId,
          name: 'second',
        },
        {
          channelId: thirdId,
          name: 'third',
        },
      ],
    });
  });
});
