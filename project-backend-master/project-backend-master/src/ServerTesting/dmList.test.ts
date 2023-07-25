import { requestAuthRegister, requestClear, requestDmCreate, requestDmList } from '../wrappers';
import { authUserId } from '../interfaces';

// Global
let registered: authUserId;
let registered2: authUserId;
let registered3: authUserId;
let registered4: authUserId;
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
  uIds = [registered2.authUserId, registered3.authUserId, registered4.authUserId];
  dmId = requestDmCreate(registered.token, uIds).dmId;
  uIds2 = [registered2.authUserId];
  dmId2 = requestDmCreate(registered.token, uIds2).dmId;
});

describe('DmList Success:', () => {
  test('Test 1', () => {
    expect(requestDmList(registered3.token).body).toStrictEqual({
      dms: [{
        dmId: dmId,
        name: 'adamb, cb, eb, fb'
      }]
    });
  });

  test('Test 2', () => {
    expect(requestDmList(registered2.token).body).toStrictEqual({
      dms: [{
        dmId: dmId,
        name: 'adamb, cb, eb, fb'
      },
      {
        dmId: dmId2,
        name: 'adamb, cb'
      }]
    });
  });
});

describe('DmList Error:', () => {
  test('Test 1: Invalid Token', () => {
    expect(requestDmList(registered2.token + registered.token + registered3.token + registered4.token).statusCode).toBe(403);
    expect(requestDmList(registered2.token + registered.token + registered3.token + registered4.token).body.error).toStrictEqual(
      { message: expect.any(String) }
    );
  });
});
