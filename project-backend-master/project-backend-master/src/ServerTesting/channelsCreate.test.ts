
import { requestChannelsCreate, requestClear, requestAuthRegister } from './../wrappers';

// test success cases
describe('channelsCreateV2 Success Test', () => {
  beforeEach(() => {
    requestClear();
  });

  test('Test 1', () => {
    const token = requestAuthRegister('albert.kim@gmail.com', 'albert123', 'Albert', 'Kim').token;
    expect(requestChannelsCreate(token, 'chat', true).body).toStrictEqual({ channelId: expect.any(Number) });
  });

  test('Test 2', () => {
    const token = requestAuthRegister('albert.kim@gmail.com', 'albert123', 'Albert', 'Kim').token;
    expect(requestChannelsCreate(token, 'chat123CHAT', true).body).toStrictEqual({ channelId: expect.any(Number) });
  });

  test('Test 3', () => {
    const token = requestAuthRegister('albert.kim@gmail.com', 'albert123', 'Albert', 'Kim').token;
    expect(requestChannelsCreate(token, 'chat', false).body).toStrictEqual({ channelId: expect.any(Number) });
  });

  test('Test 4', () => {
    const token = requestAuthRegister('albert.kim@gmail.com', 'albert123', 'Albert', 'Kim').token;
    expect(requestChannelsCreate(token, 'chat123CHAT', false).body).toStrictEqual({ channelId: expect.any(Number) });
  });

  test('Test 5', () => {
    const token2 = requestAuthRegister('adam.baqaie@gmail.com', 'adam123', 'Adam', 'Baqaie').token;
    expect(requestChannelsCreate(token2, 'chat', true).body).toStrictEqual({ channelId: expect.any(Number) });
  });

  test('Test 6', () => {
    const token2 = requestAuthRegister('adam.baqaie@gmail.com', 'adam123', 'Adam', 'Baqaie').token;
    expect(requestChannelsCreate(token2, 'chat123CHAT', true).body).toStrictEqual({ channelId: expect.any(Number) });
  });

  test('Test 7', () => {
    const token2 = requestAuthRegister('adam.baqaie@gmail.com', 'adam123', 'Adam', 'Baqaie').token;
    expect(requestChannelsCreate(token2, 'chat', false).body).toStrictEqual({ channelId: expect.any(Number) });
  });

  test('Test 8', () => {
    const token2 = requestAuthRegister('adam.baqaie@gmail.com', 'adam123', 'Adam', 'Baqaie').token;
    expect(requestChannelsCreate(token2, 'chat123CHAT', false).body).toStrictEqual({ channelId: expect.any(Number) });
  });
});

// test Error cases
describe('channelsCreateV2 Error Test', () => {
  beforeEach(() => {
    requestClear();
  });

  test('Test 1: Invalid name (too short)', () => {
    const token = requestAuthRegister('albert.kim@gmail.com', 'albert123', 'Albert', 'Kim').token;
    expect(requestChannelsCreate(token, '', true).statusCode).toBe(400);
    expect(requestChannelsCreate(token, '', true).body.error).toEqual({ message: expect.any(String) });
  });

  test('Test 2: Invalid name (too long)', () => {
    const token = requestAuthRegister('albert.kim@gmail.com', 'albert123', 'Albert', 'Kim').token;
    expect(requestChannelsCreate(token, 'asdflaskdjfhakjhflkasjhdl', false).statusCode).toBe(400);
    expect(requestChannelsCreate(token, 'asdflaskdjfhakjhflkasjhdl', false).body.error).toEqual({ message: expect.any(String) });
  });

  test('Test 3: Invalid token', () => {
    const token = requestAuthRegister('albert.kim@gmail.com', 'albert123', 'Albert', 'Kim').token;
    const invalidUserId = token + 1;
    expect(requestChannelsCreate(invalidUserId, 'channel', true).statusCode).toBe(403);
    expect(requestChannelsCreate(invalidUserId, 'channel', true).body.error).toEqual({ message: expect.any(String) });
  });
});
