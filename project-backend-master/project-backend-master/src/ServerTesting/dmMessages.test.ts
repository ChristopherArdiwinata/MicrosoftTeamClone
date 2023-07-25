import { requestAuthRegister, requestClear, requestDmCreate, requestDmMessages, requestMessageSenddm } from '../wrappers';
import { authUserId } from '../interfaces';

// Global
let registered: authUserId;
let registered2: authUserId;
let registered3: authUserId;
let registered4: authUserId;
let registered5: authUserId;
let uIds: number[];
let uIds2: number[];
let dmId: number;
let dmId2: number;
beforeEach(() => {
  requestClear();
  registered = requestAuthRegister('adam.baqaie@gmail.com', 'adam123', 'Adam', 'B');
  registered2 = requestAuthRegister('adam@gmail.com', 'adam123', 'C', 'B');
  registered3 = requestAuthRegister('baqaie@gmail.com', 'adam123', 'E', 'B');
  registered4 = requestAuthRegister('a@gmail.com', 'adam123', 'F', 'B');
  registered5 = requestAuthRegister('aa@gmail.com', 'adam123', 'G', 'H');
  uIds = [registered2.authUserId, registered3.authUserId, registered4.authUserId];
  dmId = requestDmCreate(registered.token, uIds).dmId;
  uIds2 = [registered2.authUserId];
  dmId2 = requestDmCreate(registered.token, uIds2).dmId;
});

describe('dmDetails Success', () => {
  test('Test 1', () => {
    expect(requestDmMessages(registered2.token, dmId2, 0).body).toStrictEqual({
      messages: [],
      start: 0,
      end: -1
    });
  });

  test('Test 2', () => {
    for (let i = 0; i < 55; i++) {
      requestMessageSenddm(registered2.token, dmId2, 'i');
    }
    expect(requestDmMessages(registered2.token, dmId2, 0).body).toStrictEqual(expect.any(Object));
  });
});

describe('dmMessages Error', () => {
  test('Test 1: Invalid Token', () => {
    expect(requestDmMessages(registered2.token + registered.token + registered3.token + registered4.token + registered5.token, dmId, 0).statusCode).toBe(403);
    expect(requestDmMessages(registered2.token + registered.token + registered3.token + registered4.token + registered5.token, dmId, 0).body.error).toStrictEqual({ message: expect.any(String) });
  });

  test('Test 2: Invalid dmId', () => {
    expect(requestDmMessages(registered2.token, (dmId2 + dmId) * 111, 0).statusCode).toBe(400);
    expect(requestDmMessages(registered2.token, (dmId2 + dmId) * 111, 0).body.error).toStrictEqual({ message: expect.any(String) });
  });

  test('Test 3: Member is not in DM', () => {
    expect(requestDmMessages(registered5.token, dmId, 0).statusCode).toBe(403);
    expect(requestDmMessages(registered5.token, dmId, 0).body.error).toStrictEqual({ message: expect.any(String) });
  });

  test('Test 4: Start is too large', () => {
    expect(requestDmMessages(registered2.token, dmId, 99999999999999).statusCode).toBe(400);
    expect(requestDmMessages(registered2.token, dmId, 99999999999999).body.error).toStrictEqual({ message: expect.any(String) });
  });
});
