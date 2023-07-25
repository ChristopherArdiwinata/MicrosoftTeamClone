import {
  requestAuthRegister, requestClear, requestDmCreate,
  requestDmRemove, requestDmLeave
} from '../wrappers';

import { authUserId } from '../interfaces';

// Global
let registered: authUserId;
let registered2: authUserId;
let uIds: number[];
let dmId: number;
beforeAll(() => {
  requestClear();
  registered = requestAuthRegister('adam.baqaie@gmail.com', 'adam123', 'Adam', 'B');
  registered2 = requestAuthRegister('adam@gmail.com', 'adam123', 'Adam', 'B');
  uIds = [registered2.authUserId];
  dmId = requestDmCreate(registered.token, uIds).dmId;
});

describe('Correct Dm Remove', () => {
  test('Correct removal', () => {
    expect(requestDmRemove(registered.token, dmId)).toStrictEqual({});
  });
});

describe('Incorrect Dm Remove', () => {
  test('Invalid dmId', () => {
    expect(requestDmRemove(registered.token, (dmId * Date.now())).error).toStrictEqual({ message: expect.any(String) });
    requestDmLeave(registered.token, dmId);
    expect(requestDmRemove(registered.token, dmId).error).toStrictEqual({ message: expect.any(String) });
  });
  test('Invalid token', () => {
    expect(requestDmRemove(registered2.token, dmId).error).toStrictEqual({ message: expect.any(String) });
    expect(requestDmRemove((registered2.token + Date.now()), dmId).error).toStrictEqual({ message: expect.any(String) });
  });
});
